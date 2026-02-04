import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import {
  EmailAlreadyExistsException,
  InvalidRefreshTokenException,
} from './exceptions/auth.exceptions';
import {
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY_SECONDS,
  REFRESH_TOKEN_KEY,
} from './constants/auth.constants';
import { Role } from './constants/roles.enum';

interface UserPayload {
  id: number;
  name: string;
  email: string;
  role: Role;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
  ) { }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new EmailAlreadyExistsException();
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: registerDto.name,
        email: registerDto.email,
        password: hashedPassword,
        role: Role.USER,
      },
    });

    return this.generateTokens(user);
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserPayload | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, password: true, role: true },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _password, ...result } = user;
      return result;
    }

    return null;
  }

  async login(user: UserPayload): Promise<AuthResponseDto> {
    return this.generateTokens(user);
  }

  async refreshTokens(
    userId: number,
    tokenId: string,
    refreshToken: string,
  ): Promise<AuthResponseDto> {
    // Verify token exists in Redis
    const storedToken = await this.redisService.get(
      REFRESH_TOKEN_KEY(userId, tokenId),
    );

    if (!storedToken || storedToken !== refreshToken) {
      throw new InvalidRefreshTokenException();
    }

    // Delete old refresh token
    await this.redisService.del(REFRESH_TOKEN_KEY(userId, tokenId));

    // Get user from database
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      throw new InvalidRefreshTokenException();
    }

    return this.generateTokens(user);
  }

  async logout(userId: number, tokenId: string): Promise<void> {
    await this.redisService.del(REFRESH_TOKEN_KEY(userId, tokenId));
  }


  private async generateTokens(
    user: UserPayload | Omit<UserPayload, 'role'> & { role?: Role },
  ): Promise<AuthResponseDto> {
    const tokenId = uuidv4();
    const userRole = (user as UserPayload).role || Role.USER;
    const payload = { sub: user.id, email: user.email, role: userRole };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = this.jwtService.sign(
      { ...payload, jti: tokenId },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: REFRESH_TOKEN_EXPIRY,
      },
    );

    // Store refresh token in Redis with TTL
    await this.redisService.set(
      REFRESH_TOKEN_KEY(user.id, tokenId),
      refreshToken,
      REFRESH_TOKEN_EXPIRY_SECONDS,
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: userRole,
      },
    };
  }
}
