import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import config from './config/env.config/config';
import { configSwagger } from '@config/swagger.config';
import { LoggerConfig } from '@config/winston.config';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(new LoggerConfig().console()),
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.setGlobalPrefix('api');

  useContainer(app.select(AppModule), {
    fallbackOnErrors: true,
  });

  const _config = config();
  app.enableCors({
    origin: _config.allowOrigins,
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
    credentials: true,
  });
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));
  configSwagger(app);
  const port = _config.port;
  await app.listen(port, '0.0.0.0');
  console.log(`Server is listening on ${await app.getUrl()}`);
}

bootstrap();
