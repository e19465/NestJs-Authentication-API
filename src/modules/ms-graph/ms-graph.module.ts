import { Module } from '@nestjs/common';
import { MsGraphController } from './ms-graph.controller';
import { MsGraphService } from './ms-graph.service';
import { DatabaseModule } from 'src/database/database.module';
import { UserMicrosoftCredentialRepository } from 'src/repository/microsoft.repository';
import { TokenCryptoHelper } from 'src/helpers/token-crypto.helper';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [MsGraphController],
  providers: [
    MsGraphService,
    UserMicrosoftCredentialRepository,
    TokenCryptoHelper,
  ],
})
export class MsGraphModule {}
