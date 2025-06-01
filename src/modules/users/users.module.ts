import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from '../../repository/users.repository';
import { DatabaseModule } from 'src/database/database.module';
import { UserMicrosoftCredentialRepository } from 'src/repository/microsoft.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, UserMicrosoftCredentialRepository],
  exports: [UsersService, UsersRepository, UserMicrosoftCredentialRepository],
})
export class UsersModule {}
