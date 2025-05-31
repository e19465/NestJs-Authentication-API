import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateUserRequesteDto } from 'src/dto/request/user.request.dto';
import { UserResponseDto } from 'src/dto/response/user.response.dto';
import { UsersRepository } from './users.repository';
import { toUserResponseDto } from 'src/helpers/response-helper';
import { normalizeEmail, normalizeRole } from 'src/helpers/shared.helper';

/**
 * UsersService provides methods for managing user accounts.
 *
 * Methods:
 * - getAllUsers(): Promise<UserResponseDto[]>
 * - me(id: string): Promise<UserResponseDto>
 * - findUsers(userId?: string, email?: string, role?: string): Promise<UserResponseDto[]>
 * - updateUser(id: string, data: UpdateUserRequesteDto): Promise<UserResponseDto>
 * - deleteUser(id: string): Promise<void>
 */
@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UsersRepository) {}

  /**
   * Retrieves all users from the repository.
   *
   * @returns Promise resolving to an array of UserResponseDto objects.
   * @throws Any error encountered during the repository operation.
   */
  async getAllUsers(): Promise<UserResponseDto[]> {
    try {
      const users = await this.userRepository.getAllUsers();
      return users.map((user) => toUserResponseDto(user));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves the user information for the given user ID.
   *
   * @param id - The unique identifier of the user.
   * @returns Promise resolving to a UserResponseDto object.
   * @throws BadRequestException if the ID is missing or user is not found.
   */
  async me(id: string): Promise<UserResponseDto> {
    try {
      if (!id) {
        throw new BadRequestException('User ID is required');
      }
      const users = await this.userRepository.findUsersById(id);
      if (!users) {
        throw new BadRequestException('User not found');
      }
      const user = users[0];

      if (!user) {
        throw new BadRequestException('User not found');
      }

      return toUserResponseDto(user);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Finds users based on provided identifiers: userId, email, or role.
   * At least one identifier must be provided.
   *
   * @param userId - The unique identifier of the user (optional).
   * @param email - The email address of the user (optional).
   * @param role - The role of the user (optional).
   * @returns Promise resolving to an array of UserResponseDto objects.
   * @throws BadRequestException if no identifier is provided or role is invalid.
   */
  async findUsers(
    userId?: string,
    email?: string,
    role?: string,
  ): Promise<UserResponseDto[]> {
    if (!userId && !email && !role) {
      throw new BadRequestException(
        'At least one identifier is required (userId, email, or role)',
      );
    }

    const normalizedEmail = email ? normalizeEmail(email) : undefined;
    const normalizedRole = role ? normalizeRole(role) : undefined;

    if (role && !normalizedRole) {
      throw new BadRequestException('Invalid role provided');
    }

    let users;

    // All three provided
    if (userId && normalizedEmail && normalizedRole) {
      users = await this.userRepository.findUsersByIdEmailRole(
        userId,
        normalizedEmail,
        normalizedRole,
      );
    }
    // Two provided
    else if (userId && normalizedEmail) {
      users = await this.userRepository.findUsersByIdAndEmail(
        userId,
        normalizedEmail,
      );
    } else if (userId && normalizedRole) {
      users = await this.userRepository.findUsersByIdAndRole(
        userId,
        normalizedRole,
      );
    } else if (normalizedEmail && normalizedRole) {
      users = await this.userRepository.findUsersByEmailAndRole(
        normalizedEmail,
        normalizedRole,
      );
    }
    // One provided
    else if (userId) {
      users = await this.userRepository.findUsersById(userId);
    } else if (normalizedEmail) {
      users = await this.userRepository.findUsersByEmail(normalizedEmail);
    } else if (normalizedRole) {
      users = await this.userRepository.findUsersByRole(normalizedRole);
    }

    const responseUsers = users?.map((user) => toUserResponseDto(user));
    return responseUsers;
  }

  /**
   * Updates the user account with the given ID using the provided data.
   *
   * @param id - The unique identifier of the user to update.
   * @param data - The data to update the user with.
   * @returns Promise resolving to the updated UserResponseDto object.
   * @throws Any error encountered during the update operation.
   */
  async updateUser(
    id: string,
    data: UpdateUserRequesteDto,
  ): Promise<UserResponseDto> {
    try {
      const updateData = data.toUpdateUserRepositoryModel();
      const updatedUser = await this.userRepository.updateUserAccount(
        updateData,
        id,
      );
      return toUserResponseDto(updatedUser);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Deletes the user account with the specified ID.
   *
   * @param id - The unique identifier of the user to delete.
   * @returns Promise resolving to void.
   * @throws Any error encountered during the delete operation.
   */
  async deleteUser(id: string): Promise<void> {
    try {
      await this.userRepository.deleteUserAccount(id);
      return;
    } catch (error) {
      throw error;
    }
  }
}
