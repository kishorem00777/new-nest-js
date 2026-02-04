import { Controller, Post, Body, Param, Headers, UnauthorizedException, Get } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Controller('orders')
export class OrdersController {
    constructor(
        @Inject('ORDERS_SERVICE') private ordersClient: ClientProxy,
        @Inject('AUTH_SERVICE') private authClient: ClientProxy,
    ) { }

    @Get()
    async getAllOrders(@Headers('authorization') authHeader: string) {
        // Extract token from Authorization header
        const token = this.extractToken(authHeader);

        // Validate token via Auth Service
        const user = await firstValueFrom(
            this.authClient.send({ cmd: 'auth_validate' }, { token })
        );

        // Forward to Orders Service with validated userId
        return firstValueFrom(
            this.ordersClient.send(
                { cmd: 'order_get_all' },
                { userId: user.userId }
            )
        );
    }

    @Post("create")
    async createOrder(@Body() dto: any, @Headers('authorization') authHeader: string) {
        // Extract token from Authorization header
        const token = this.extractToken(authHeader);

        // Validate token via Auth Service
        const user = await firstValueFrom(
            this.authClient.send({ cmd: 'auth_validate' }, { token })
        );

        // Forward to Orders Service with validated userId
        return firstValueFrom(
            this.ordersClient.send(
                { cmd: 'order_create' },
                { dto, userId: user.userId }
            )
        );
    }

    @Post(':id/cancel')
    async cancelOrder(@Param('id') orderId: string, @Headers('authorization') authHeader: string) {
        // Extract token from Authorization header
        const token = this.extractToken(authHeader);

        // Validate token via Auth Service
        const user = await firstValueFrom(
            this.authClient.send({ cmd: 'auth_validate' }, { token })
        );

        // Forward to Orders Service with validated userId
        return firstValueFrom(
            this.ordersClient.send(
                { cmd: 'order_cancel' },
                { orderId, userId: user.userId }
            )
        );
    }

    private extractToken(authHeader: string): string {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing or invalid authorization header');
        }
        return authHeader.substring(7); // Remove 'Bearer ' prefix
    }
}
