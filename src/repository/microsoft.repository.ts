/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import {
  StoreMicrosoftCredentialsOutlookRepositoryModel,
  StoreMicrosoftCredentialsRepositoryModel,
} from './models/microsoft.models';
import {
  MicrosoftTokenInsertResponseDto,
  MicrosoftTokenInsertResponseOutlookDto,
} from 'src/dto/response/microsoft.response.dto';

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

  async storeMicrosoftCredentialsOutlook(
    data: StoreMicrosoftCredentialsOutlookRepositoryModel,
  ): Promise<MicrosoftTokenInsertResponseOutlookDto> {
    try {
      const response =
        (await this.databaseService.userMicrosoftOutlookCredential.upsert({
          where: { email: data.email },
          update: {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            idToken: data.idToken,
          },
          create: {
            email: data.email,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            idToken: data.idToken,
          },
        })) as MicrosoftTokenInsertResponseOutlookDto;
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
