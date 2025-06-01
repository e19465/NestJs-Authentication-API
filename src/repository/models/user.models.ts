import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsOptional,
} from 'class-validator';
import { Role } from 'generated/prisma';

/**
 * Repository model for creating a new user.
 *
 * This class defines the structure and validation rules for user creation data
 * at the repository layer. It includes fields for the user's name, email, role, and password.
 *
 * @property name - The full name of the user. Must be a non-empty string.
 * @property email - The email address of the user. Must be a valid, non-empty email.
 * @property role - The role assigned to the user. Must be a valid value from the {@link Role} enum.
 * @property password - The user's password. Must be a non-empty string.
 */
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

/**
 * Repository model for updating user information.
 *
 * This class is used to encapsulate the data required to update a user's details in the repository layer.
 * All properties are optional to allow partial updates.
 *
 * @property name - The new name of the user. Optional.
 */
export class UpdateUserRepositoryModel {
  @IsOptional()
  @IsString()
  name?: string;
}
