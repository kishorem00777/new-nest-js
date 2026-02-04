import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @MessagePattern({ cmd: 'order_create' })
  async createOrder(@Payload() data: { dto: CreateOrderDto; userId: string }) {
    return this.ordersService.create(data.dto, data.userId);
  }

  @MessagePattern({ cmd: 'order_cancel' })
  async cancelOrder(@Payload() data: { orderId: string; userId: string }) {
    return this.ordersService.cancel(data.orderId, data.userId);
  }

  @MessagePattern({ cmd: 'order_get_all' })
  async getAllOrders(@Payload() data: { userId: string }) {
    return this.ordersService.findAll(data.userId);
  }
}
