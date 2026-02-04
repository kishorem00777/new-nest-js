import { Controller, Post, Get, Body } from '@nestjs/common';
import { IsEmail, IsString, IsOptional } from 'class-validator';
import { EmailService } from './services/email.service';
import { Public } from '../auth/decorators/public.decorator';

class TestEmailDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsOptional()
    username?: string;
}

class NotificationDto {
    @IsEmail()
    email: string;

    @IsString()
    subject: string;

    @IsString()
    message: string;
}

@Controller('queue')
export class QueueController {
    constructor(private readonly emailService: EmailService) { }

    /**
     * Test endpoint - Send a welcome email
     * POST /queue/test-welcome
     */
    @Public()
    @Post('test-welcome')
    async testWelcomeEmail(@Body() dto: TestEmailDto) {
        const jobId = await this.emailService.sendWelcomeEmail(
            dto.email,
            dto.username || 'New User',
        );

        return {
            message: 'Welcome email job added to queue',
            jobId,
        };
    }

    /**
     * Test endpoint - Send a password reset email
     * POST /queue/test-reset
     */
    @Public()
    @Post('test-reset')
    async testPasswordResetEmail(@Body() dto: TestEmailDto) {
        const mockToken = `reset_${Date.now()}`;
        const jobId = await this.emailService.sendPasswordResetEmail(dto.email, mockToken);

        return {
            message: 'Password reset email job added to queue',
            jobId,
        };
    }

    /**
     * Test endpoint - Send a notification email
     * POST /queue/test-notification
     */
    @Public()
    @Post('test-notification')
    async testNotificationEmail(@Body() dto: NotificationDto) {
        const jobId = await this.emailService.sendNotificationEmail(
            dto.email,
            dto.subject,
            dto.message,
        );

        return {
            message: 'Notification email job added to queue',
            jobId,
        };
    }

    /**
     * Get queue statistics
     * GET /queue/stats
     */
    @Public()
    @Get('stats')
    async getStats() {
        const stats = await this.emailService.getQueueStats();
        return {
            queue: 'email',
            ...stats,
        };
    }
}
