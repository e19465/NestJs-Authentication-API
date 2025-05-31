import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UsersModule, AuthModule } from './modules';
import { CustomLoggerModule } from './custom-logger/custom-logger.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // makes config accessible app-wide
      envFilePath: '.env', // optional, default is '.env'
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: 5000, // 5 seconds in milliseconds
          limit: 2, // maximum number of requests(5) allowed in the ttl period
        },
        {
          name: 'medium',
          ttl: 60000, // 1 minute in milliseconds
          limit: 100, // maximum number of requests(10) allowed in the ttl period
        },
        {
          name: 'long',
          ttl: 300000, // 5 minutes in milliseconds
          limit: 400, // maximum number of requests(10) allowed in the ttl period
        },
      ],
    }),
    UsersModule,
    AuthModule,
    DatabaseModule,
    CustomLoggerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
