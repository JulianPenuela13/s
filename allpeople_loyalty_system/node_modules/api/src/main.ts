// packages/api/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // Importamos ValidationPipe
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitamos CORS
  app.enableCors();

  // Habilitamos el uso de express para los body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Usamos un ValidationPipe global para que todos los DTOs se validen
  app.useGlobalPipes(new ValidationPipe());

  // Ponemos la aplicación a escuchar en el puerto 3000
  await app.listen(3000);
}
bootstrap();