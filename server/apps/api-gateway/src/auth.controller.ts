import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
    constructor(@Inject('AUTH_SERVICE') private authClient: ClientProxy) { }

    @Post('signup')
    signup(@Body() dto: any) {
        return this.authClient.send({ cmd: 'auth_register' }, dto);
    }

    @Post('signin')
    signin(@Body() dto: any) {
        return this.authClient.send({ cmd: 'auth_login' }, dto);
    }

    @Post('refresh')
    refresh(@Body() dto: { userId: string; rt: string }) {
        return this.authClient.send({ cmd: 'auth_refresh' }, dto);
    }

    @Post('logout')
    logout(@Body() dto: { userId: string }) {
        return this.authClient.send({ cmd: 'auth_logout' }, dto);
    }
}
