import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DatabaseModule } from 'src/database/database.module';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthLocalStrategy } from 'src/stratergies/auth.local.stratergy';
import { AuthJwtStrategy } from 'src/stratergies/auth.jwt.stratergy';

@Module({
  imports: [
    PassportModule,
    DatabaseModule,
    UsersModule,
    JwtModule.register({}),
  ],
  providers: [AuthService, AuthLocalStrategy, AuthJwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
