/* eslint-disable prettier/prettier */
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {

    constructor(private readonly mailService: MailerService) { }
    public async sendWelcomeEmail(email: string, name: string): Promise<void> {
        // Implementation for sending welcome email
        await this.mailService.sendMail({
            to: email,
            from: 'noreply@yourdomain.com',
            subject: 'Welcome to MovieApp!',
            template: 'emailtemplate',
            context: { name: name, email: email }
        });
    }

    public async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
        const verificationLink = `${process.env.DOMAIN}/?token=${token}&email=${email}`;
        await this.mailService.sendMail({
            to: email,
            from: 'noreply@yourdomain.com',
            subject: 'Verify Your MovieApp Account',
            template: 'verificationtemplate',
            context: { name: name, verificationLink: verificationLink }
        });
    }
}
