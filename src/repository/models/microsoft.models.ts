import { IsNotEmpty, IsString } from 'class-validator';

export class StoreMicrosoftCredentialsRepositoryModel {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @IsNotEmpty()
  @IsString()
  refreshToken: string;

  @IsNotEmpty()
  @IsString()
  idToken: string;
}
