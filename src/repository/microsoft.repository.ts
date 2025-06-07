import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { StoreMicrosoftCredentialsRepositoryModel } from './models/microsoft.models';
import { MicrosoftTokenInsertResponseDto } from 'src/dto/response/microsoft.response.dto';

@Injectable()
export class UserMicrosoftCredentialRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async storeMicrosoftCredentials(
    data: StoreMicrosoftCredentialsRepositoryModel,
  ): Promise<MicrosoftTokenInsertResponseDto> {
    try {
      const response =
        (await this.databaseService.userMicrosoftCredential.upsert({
          where: { userId: data.userId },
          update: {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            idToken: data.idToken,
          },
          create: {
            userId: data.userId,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            idToken: data.idToken,
          },
        })) as MicrosoftTokenInsertResponseDto;
      return response;
    } catch (error) {
      throw error;
    }
  }

  async retrieveCredentialsForUser(
    userId: string,
  ): Promise<MicrosoftTokenInsertResponseDto | null> {
    try {
      const response =
        (await this.databaseService.userMicrosoftCredential.findUnique({
          where: { userId },
        })) as MicrosoftTokenInsertResponseDto | null;
      return response;
    } catch (error) {
      throw error;
    }
  }

  async deleteMicrosoftCredentials(userId: string): Promise<void> {
    try {
      await this.databaseService.userMicrosoftCredential.delete({
        where: { userId },
      });
    } catch (error) {
      throw error;
    }
  }
}
