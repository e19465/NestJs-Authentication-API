import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  ValidateNested,
  IsDateString,
} from 'class-validator';

export class MicrosoftTokenInsertResponseDto {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  idToken: string;
  createdAt: Date;
  updatedAt: Date;
}

export class MicrosoftAccountResponseDto {
  '@odata.context': string;
  businessPhones: string[];
  displayName: string;
  givenName: string;
  jobTitle: string | null;
  mail: string | null;
  mobilePhone: string;
  officeLocation: string | null;
  preferredLanguage: string;
  surname: string;
  userPrincipalName: string;
  id: string;
}

// List items in OneDrive response DTOs
class ApplicationDto {
  @IsString()
  id: string;

  @IsString()
  displayName: string;
}

class UserDto {
  @IsString()
  email: string;

  @IsString()
  id: string;

  @IsString()
  displayName: string;
}

class ActorDto {
  @ValidateNested()
  @Type(() => ApplicationDto)
  application: ApplicationDto;

  @ValidateNested()
  @Type(() => UserDto)
  user: UserDto;
}

class ParentReferenceDto {
  @IsString()
  driveType: string;

  @IsString()
  driveId: string;

  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  path: string;

  @IsString()
  siteId: string;
}

class FileSystemInfoDto {
  @IsDateString()
  createdDateTime: string;

  @IsDateString()
  lastModifiedDateTime: string;
}

class FolderDto {
  @IsNumber()
  childCount: number;
}

class SpecialFolderDto {
  @IsString()
  name: string;
}

export class MsGraphItemDto {
  @ValidateNested()
  @Type(() => ActorDto)
  createdBy: ActorDto;

  @IsDateString()
  createdDateTime: string;

  @IsString()
  eTag: string;

  @IsString()
  id: string;

  @ValidateNested()
  @Type(() => ActorDto)
  lastModifiedBy: ActorDto;

  @IsDateString()
  lastModifiedDateTime: string;

  @IsString()
  name: string;

  @ValidateNested()
  @Type(() => ParentReferenceDto)
  parentReference: ParentReferenceDto;

  @IsString()
  webUrl: string;

  @IsString()
  cTag: string;

  @ValidateNested()
  @Type(() => FileSystemInfoDto)
  fileSystemInfo: FileSystemInfoDto;

  @ValidateNested()
  @Type(() => FolderDto)
  folder: FolderDto;

  @IsNumber()
  size: number;

  @ValidateNested()
  @Type(() => SpecialFolderDto)
  specialFolder: SpecialFolderDto;
}

export class ListItemsInOneDriveResponseDto {
  '@odata.context': string;
  value: MsGraphItemDto[];
}

//! End - List items in OneDrive response DTOs
