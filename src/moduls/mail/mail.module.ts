/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { join } from 'node:path';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { Resend } from 'resend';
// import * as sgMail from '@sendgrid/mail';
@Module({
  providers: [MailService],
  imports: [MailerModule.forRootAsync({
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      transport: {
        // host: configService.get<string>('MAIL_HOST'),
        // port: configService.get<number>('MAIL_PORT'),
        // secure : process.env.NODE_ENV === 'production' ? true : false,
        // auth: {
        //   user: configService.get<string>('MAIL_USERNAME'),
        //   pass: configService.get<string>('MAIL_PASSWORD'),
        // },
        name: "resend-transport",
        version: "1.0.0",
        send: async (mailConfig: any, callback: (error: Error | null, info: any) => void) => {
          try {
            const resend = new Resend(configService.get<string>('RESEND_API_KEY'));
            const html = mailConfig.data.html;
            const text = mailConfig.data.text;

            const res = await resend.emails.send({
              from: configService.get<string>("MAIL_FROM") || "MyApp <no-reply@myapp.com>",
              to: mailConfig.data.to,
              subject: mailConfig.data.subject,
              html: html,
              text: text,
            });
            return callback(null, res);
          } catch (error) {
            return callback(error as Error, null);
          }
        }
      },
      template: {
        dir: join(process.cwd(), 'dist/moduls/mail/templates'),
        adapter: new EjsAdapter({ inlineCssEnabled: true }),
      }
    }),
  })],
  exports: [MailService],
})
export class MailModule { }
