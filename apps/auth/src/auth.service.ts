import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as bcrypt from 'bcrypt';
import { PrismaService } from './prisma/prisma.service';
import { AuthDto, AuthResponseDto, CreateUserDto } from './dto';
import { Tokens } from './types/tokens.type';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) { }

  async signup(dto: CreateUserDto): Promise<Tokens> {
    const hash = await this.hashData(dto.password);
    try {
      const newUser = await this.prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          email: dto.email,
          password: hash,
          name: dto.name,
        },
      });
      const tokens = await this.getTokens(newUser.id, newUser.email);
      return tokens;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  async signin(dto: AuthDto): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new ForbiddenException('Access Denied');

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    const responseUser = plainToInstance(AuthResponseDto, user);
    console.log("user", responseUser);

    return { ...tokens, ...responseUser };
  }

  async logout(userId: string) {
    // Stateless logout: Client should discard the token.
    // Without a whitelist/blacklist or DB persistence, we cannot invalidate it server-side.
    return true;
  }

  async refreshTokens(userId: string, rt: string): Promise<Tokens> {
    // Verify the Refresh Token (Stateless)
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) throw new ForbiddenException('Access Denied');

    try {
      this.jwtService.verify(rt, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new ForbiddenException('Invalid refresh token');
    }

    const tokens = await this.getTokens(user.id, user.email);
    return tokens;
  }

  async validateAccessToken(token: string): Promise<{ userId: string; email: string }> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      });

      // Verify user still exists
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new ForbiddenException('User not found');
      }

      return {
        userId: payload.sub,
        email: payload.email,
      };
    } catch (error) {
      throw new ForbiddenException('Invalid or expired token');
    }
  }

  hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  async getTokens(userId: string, email: string): Promise<Tokens> {
    const jwtPayload = {
      sub: userId,
      email: email,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}
