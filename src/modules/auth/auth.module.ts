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
    JwtModule.register({
      secret: 'test-secret',
      signOptions: { expiresIn: '1h' }, // Token expiration time
      global: true, // Makes the JWT module available globally
      verifyOptions: {
        algorithms: ['HS256'], // Specify the algorithm used for signing
        ignoreExpiration: false, // Ensure expiration is checked
      },
    }),
  ],
  providers: [AuthService, AuthLocalStrategy, AuthJwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
