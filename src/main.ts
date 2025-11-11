/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { QueryExceptionFilter } from './common/filters/query-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
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
    .addTag('movies')
    .addServer('http://localhost:3000', 'Local Development Server')
    .setTermsOfService('http://example.com/terms/')
    .setContact(
      'Movie App Support',
      'http://example.com/support',
      'support@example.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();
    const document = SwaggerModule.createDocument(app, swagger);
    // access swagger at /api/v1/swagger
    SwaggerModule.setup('api/v1/swagger', app, document);
  await app.listen(process.env.PORT ?? 3001, () => {
    console.log("server listen on port ", process.env.PORT ?? 3001);
  });
}
bootstrap();
