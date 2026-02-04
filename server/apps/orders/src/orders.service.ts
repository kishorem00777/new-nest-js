import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from './prisma/prisma.service';
import { CreateOrderDto } from './dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    @Inject('RABBITMQ_CLIENT') private client: ClientProxy,
  ) { }

  async create(dto: CreateOrderDto, userId: string) {
    const order = await this.prisma.order.create({
      data: {
        userId,
        productId: dto.productId,
        quantity: dto.quantity,
        status: 'PLACED',
      },
    });

    // Emit event for notification service
    this.client.emit('order_placed', {
      orderId: order.id,
      userId: order.userId,
    });

    return {
      id: order.id,
      status: order.status,
      message: 'Order placed successfully',
    };
  }

  async cancel(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('You do not own this order');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });

    // Emit event for notification service
    this.client.emit('order_cancelled', {
      orderId: updatedOrder.id,
      userId: updatedOrder.userId,
    });

    return {
      id: updatedOrder.id,
      status: updatedOrder.status,
      message: 'Order cancelled',
    };
  }

  async findAll(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
