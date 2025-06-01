import { IsEmail, IsString, IsOptional } from 'class-validator';
import { UpdateUserRepositoryModel } from 'src/repository/models/user.models';

/**
 * Data Transfer Object for updating user requests.
 * This DTO is used to validate the data for updating user information.
 * It includes optional fields for the user's name, email.
 *
 * @class UpdateUserRequesteDto
 * @property {string} [name] - The name of the user. Optional for updates.
 * @property {string} [email] - The email of the user. Optional for updates.
 * @method toUpdateUserRepositoryModel - Converts the DTO to a repository model for updating user information.
 *
 * @example
 * const updateUserDto: UpdateUserRequesteDto = {
 *    name: 'John Doe',
 *    email: 'john@gmail.com'
 * };
 *
 * @example
 * const data: UpdateUserRepositoryModel = updateUserDto.toUpdateUserRepositoryModel();
 * */
export class UpdateUserRequesteDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  /**
   * Converts the current DTO instance to an `UpdateUserRepositoryModel`.
   *
   * @returns {UpdateUserRepositoryModel} An object containing the user's updated properties,
   * specifically the `name` field, to be used by the repository layer.
   */
  toUpdateUserRepositoryModel(): UpdateUserRepositoryModel {
    return {
      name: this.name,
    };
  }
}
