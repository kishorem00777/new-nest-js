import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { AuthDto, CreateUserDto } from './dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @MessagePattern({ cmd: 'auth_register' })
  async register(@Payload() dto: CreateUserDto) {
    return this.authService.signup(dto);
  }

  @MessagePattern({ cmd: 'auth_login' })
  async login(@Payload() dto: AuthDto) {
    return this.authService.signin(dto);
  }

  @MessagePattern({ cmd: 'auth_refresh' })
  async refresh(@Payload() data: { userId: string; refreshToken: string }) {
    return this.authService.refreshTokens(data.userId, data.refreshToken);
  }

  @MessagePattern({ cmd: 'auth_logout' })
  async logout(@Payload() data: { userId: string }) {
    return this.authService.logout(data.userId);
  }

  @MessagePattern({ cmd: 'auth_validate' })
  async validateToken(@Payload() data: { token: string }) {
    return this.authService.validateAccessToken(data.token);
  }
}
