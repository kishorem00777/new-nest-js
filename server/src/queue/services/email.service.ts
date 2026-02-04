import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EmailJobData } from '../processors/email.processor';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    constructor(@InjectQueue('email') private readonly emailQueue: Queue<EmailJobData>) { }

    /**
     * Send a welcome email to a new user
     */
    async sendWelcomeEmail(email: string, username: string): Promise<string> {
        const job = await this.emailQueue.add('welcome', {
            to: email,
            subject: `Welcome to Hello Nest, ${username}!`,
            body: `Hi ${username},\n\nThank you for joining Hello Nest! We're excited to have you on board.\n\nBest regards,\nThe Hello Nest Team`,
            type: 'welcome',
        });

        this.logger.log(`📧 Welcome email job queued: ${job.id}`);
        return job.id as string;
    }

    /**
     * Send a password reset email
     */
    async sendPasswordResetEmail(email: string, resetToken: string): Promise<string> {
        const job = await this.emailQueue.add(
            'password-reset',
            {
                to: email,
                subject: 'Password Reset Request',
                body: `You requested a password reset. Use this token: ${resetToken}\n\nIf you didn't request this, please ignore this email.`,
                type: 'password-reset',
            },
            {
                priority: 1, // High priority
                attempts: 3, // Retry 3 times if failed
                backoff: {
                    type: 'exponential',
                    delay: 2000, // Start with 2 second delay
                },
            },
        );

        this.logger.log(`🔑 Password reset email job queued: ${job.id}`);
        return job.id as string;
    }

    /**
     * Send a general notification email
     */
    async sendNotificationEmail(email: string, subject: string, message: string): Promise<string> {
        const job = await this.emailQueue.add('notification', {
            to: email,
            subject,
            body: message,
            type: 'notification',
        });

        this.logger.log(`🔔 Notification email job queued: ${job.id}`);
        return job.id as string;
    }

    /**
     * Get queue statistics
     */
    async getQueueStats() {
        const [waiting, active, completed, failed] = await Promise.all([
            this.emailQueue.getWaitingCount(),
            this.emailQueue.getActiveCount(),
            this.emailQueue.getCompletedCount(),
            this.emailQueue.getFailedCount(),
        ]);

        return { waiting, active, completed, failed };
    }
}
