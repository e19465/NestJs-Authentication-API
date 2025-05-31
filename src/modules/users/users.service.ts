import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserRequesteDto } from 'src/dto/request/user';
import { UserResponseDto } from 'src/dto/response/user';
import { UsersRepository } from './users.repository';
import { toUserResponseDto } from 'src/helpers/response-helper';
import { normalizeEmail, normalizeRole } from 'src/helpers/shared.helper';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UsersRepository) {}

  async getAllUsers(): Promise<UserResponseDto[]> {
    try {
      const users = await this.userRepository.getAllUsers();
      return users.map((user) => toUserResponseDto(user));
    } catch (error) {
      throw error;
    }
  }

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

  async deleteUser(id: string): Promise<void> {
    try {
      await this.userRepository.deleteUserAccount(id);
      return;
    } catch (error) {
      throw error;
    }
  }
}
