/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { QueryExceptionFilter } from './common/filters/query-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import bodyParser from 'body-parser';

import {
  initializeTransactionalContext,
  addTransactionalDataSource,
} from 'typeorm-transactional';
import { DataSource } from 'typeorm';

async function bootstrap() {

  initializeTransactionalContext();

  // ❗ Important: Disable built-in bodyParser
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

  const dataSource = app.get(DataSource);
  addTransactionalDataSource(dataSource);

  app.setGlobalPrefix('api/v1',{
     exclude: ['/']
  });

  // Stripe raw body ONLY for webhook
  app.use('/api/v1/payment/webhook',
    bodyParser.raw({ type: 'application/json' }),
  );

  // Normal body parsing for the rest of the app
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

  app.use(cookieParser());
  app.use(helmet());

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:4200',
      'https://movieapp-frontend-nine.vercel.app',
    ],
    credentials: true,
  });

  app.useGlobalFilters(new QueryExceptionFilter());

  const swagger = new DocumentBuilder()
    .setTitle('Movie App API')
    .setDescription('The Movie App API description')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('api/v1/swagger', app, document);

  const port = process.env.PORT ?? 3001;

  await app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}/api/v1`);
  });
}

bootstrap();
