import { Controller, Get, Inject, Post, Body } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiGatewayService } from './api-gateway.service';

@Controller()
export class ApiGatewayController {
  constructor(
    private readonly apiGatewayService: ApiGatewayService,
    @Inject('AUTH_SERVICE') private authClient: ClientProxy,
    @Inject('ORDERS_SERVICE') private ordersClient: ClientProxy,
  ) { }



  @Post('orders')
  async createOrder(@Body() createOrderDto: any) {
    return this.ordersClient.send({ cmd: 'create_order' }, createOrderDto);
  }
}
