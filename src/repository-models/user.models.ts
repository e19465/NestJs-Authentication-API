import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsOptional,
} from 'class-validator';
import { Role } from 'generated/prisma';

export class CreateUserRepositoryModel {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class UpdateUserRepositoryModel {
  @IsOptional()
  @IsString()
  name?: string;
}
