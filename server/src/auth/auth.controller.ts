import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { Role } from './constants/roles.enum';

interface UserPayload {
  id: number;
  name: string;
  email: string;
  role: Role;
}

interface RefreshPayload {
  sub: number;
  jti: string;
  refreshToken: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('register')
  register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@CurrentUser() user: UserPayload): Promise<AuthResponseDto> {
    return this.authService.login(user);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(@CurrentUser() user: RefreshPayload): Promise<AuthResponseDto> {
    return this.authService.refreshTokens(
      user.sub,
      user.jti,
      user.refreshToken,
    );
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(
    @CurrentUser() user: { id: number },
    @Body() { refreshToken }: RefreshTokenDto,
  ): Promise<{ message: string }> {
    // Decode token to get jti
    const decoded = JSON.parse(
      Buffer.from(refreshToken.split('.')[1], 'base64').toString(),
    ) as { jti: string };
    return this.authService.logout(user.id, decoded.jti).then(() => ({
      message: 'Logged out successfully',
    }));
  }
}
