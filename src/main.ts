import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionsFilter } from './filters/http-exception.filter';
import * as cookieParser from 'cookie-parser';
import corsOptions from './configs/cors.config';
import { API_PREFIX, PORT } from './settings';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Middleware should be registered before anything else
  app.use(cookieParser());

  // Global filters should be set early
  app.useGlobalFilters(new GlobalExceptionsFilter());

  // Set global route prefix
  app.setGlobalPrefix(API_PREFIX);

  // CORS should be configured after middleware
  app.enableCors(corsOptions);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips properties not defined in the DTO
      forbidNonWhitelisted: false, // if true - throws error if unknown properties are present
      transform: true,
    }),
  );

  // Start the application
  await app.listen(PORT, () => {
    console.log(`Nest JS Server is running on PORT: ${PORT}`);
  });
}
bootstrap();
