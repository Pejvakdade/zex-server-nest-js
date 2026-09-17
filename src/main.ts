import 'reflect-metadata';
import * as dotenv from 'dotenv';
// Same env file the ConfigModule reads (see app.module.ts) — keyed off APPLICATION_ENV, not NODE_ENV.
dotenv.config({
  path: `.env.${process.env.APPLICATION_ENV || 'development'}`,
});

import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { AppModule } from './app/app.module';
import { NestFactory } from '@nestjs/core';
import { SwaggerConfig } from './swagger/swagger.config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { API_PREFIX } from './values/constants';

async function bootstrap() {
  // Buffer Nest's own bootstrap lines until the pino logger is attached, so nothing is lost or unformatted.
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  // CSP is left off: Swagger UI at /docs loads inline scripts and would be blocked by helmet's default policy.
  app.use(helmet({ contentSecurityPolicy: false }));

  app.use(json({ limit: '15mb' }));
  app.use(urlencoded({ extended: true, limit: '15mb' }));

  // CORS_ORIGIN is a comma-separated allow-list; unset means "any origin" (development).
  // A wildcard cannot be combined with credentials, so credentials only go on for an explicit list.
  const corsOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins.length ? corsOrigins : '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: corsOrigins.length > 0,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle(SwaggerConfig.title)
    .setDescription(SwaggerConfig.description)
    .setVersion(SwaggerConfig.version)
    .addServer(SwaggerConfig.servers[0].url)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, { swaggerOptions: { persistAuthorization: true } });

  app.setGlobalPrefix(API_PREFIX.slice(1));

  await app.listen(process.env.APPLICATION_INTERNAL_PORT, process.env.APPLICATION_HOSTNAME);
}
bootstrap();
