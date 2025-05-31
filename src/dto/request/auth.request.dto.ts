import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * Data Transfer Object for creating and updating user requests.
 * This DTO is used to validate the data for creating and updating user information.
 * It includes validation rules for the user's name, email, and role.
 * @class SignUpUserRequesteDto
 * @property {string} name - The name of the user. Must be a non-empty string.
 * @property {string} email - The email of the user. Must be a valid email format and non-empty.
 *
 * @example
 * const createUserDto: SignUpUserRequesteDto = {
 * name: 'John Doe',
 * email: 'john@gmail.com'
 * };
 */
export class SignUpUserRequesteDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}

/**
 * Data Transfer Object for local sign-in requests.
 *
 * @property email - The user's email address. Must be a valid, non-empty email.
 * @property password - The user's password. Must be a non-empty string.
 */
export class LocalSignInRequestDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

/**
 * Data Transfer Object for handling refresh token requests.
 *
 * @remarks
 * This DTO is used to validate and transfer the refresh token
 * provided by the client when requesting a new access token.
 *
 * @property token - The refresh token string. Must be a non-empty string.
 */
export class RefreshTokenRequestDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
