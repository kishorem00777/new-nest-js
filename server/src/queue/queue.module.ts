import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailProcessor } from './processors/email.processor';
import { EmailService } from './services/email.service';
import { QueueController } from './queue.controller';

@Module({
    imports: [
        BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                connection: {
                    host: configService.get<string>('REDIS_HOST', 'localhost'),
                    port: configService.get<number>('REDIS_PORT', 6379),
                },
            }),
        }),
        BullModule.registerQueue({
            name: 'email',
        }),
    ],
    controllers: [QueueController],
    providers: [EmailProcessor, EmailService],
    exports: [EmailService],
})
export class QueueModule { }
