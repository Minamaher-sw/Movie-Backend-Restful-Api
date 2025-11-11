/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { join } from 'node:path';
import {EjsAdapter} from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
@Module({
  providers: [MailService],
  imports: [MailerModule.forRootAsync({
    inject:[ConfigService],
    useFactory: (configService: ConfigService) => ({
      transport: {
        host: configService.get<string>('MAIL_HOST'),
        port: configService.get<number>('MAIL_PORT'),
        secure : process.env.NODE_ENV === 'production' ? true : false,
        auth: {
          user: configService.get<string>('MAIL_USERNAME'),
          pass: configService.get<string>('MAIL_PASSWORD'),
        },
      },
      template :{
            dir:join(__dirname,'templates'),
        adapter : new EjsAdapter({inlineCssEnabled:true}),
      }
    }),
  })],
  exports: [MailService],
})
export class MailModule {}
