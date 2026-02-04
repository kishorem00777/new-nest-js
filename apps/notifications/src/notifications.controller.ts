import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @EventPattern('order_placed')
  async handleOrderPlaced(@Payload() data: any) {
    this.notificationsService.handleOrderPlaced(data);
  }

  @EventPattern('order_cancelled')
  async handleOrderCancelled(@Payload() data: any) {
    this.notificationsService.handleOrderCancelled(data);
  }
}
