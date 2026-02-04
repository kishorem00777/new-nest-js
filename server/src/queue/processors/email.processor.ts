import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

export interface EmailJobData {
    to: string;
    subject: string;
    body: string;
    type: 'welcome' | 'password-reset' | 'notification';
}

@Processor('email')
export class EmailProcessor extends WorkerHost {
    private readonly logger = new Logger(EmailProcessor.name);

    async process(job: Job<EmailJobData>): Promise<{ success: boolean; messageId: string }> {
        this.logger.log(`Processing job ${job.id} of type: ${job.data.type}`);
        this.logger.log(`Sending email to: ${job.data.to}`);
        this.logger.log(`Subject: ${job.data.subject}`);

        // Simulate email sending delay
        await this.delay(1000);

        // In a real app, you would integrate with an email service like:
        // - Nodemailer
        // - SendGrid
        // - AWS SES
        // - Mailgun

        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        this.logger.log(`✅ Email sent successfully! MessageId: ${messageId}`);

        return { success: true, messageId };
    }

    @OnWorkerEvent('completed')
    onCompleted(job: Job<EmailJobData>) {
        this.logger.log(`✅ Job ${job.id} completed successfully`);
    }

    @OnWorkerEvent('failed')
    onFailed(job: Job<EmailJobData>, error: Error) {
        this.logger.error(`❌ Job ${job.id} failed: ${error.message}`);
    }

    @OnWorkerEvent('active')
    onActive(job: Job<EmailJobData>) {
        this.logger.log(`⚡ Job ${job.id} is now active`);
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
