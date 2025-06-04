/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { PRISMA_CLIENT_ERROR_CODES } from 'src/constants/shared.constants';
import { DatabaseService } from 'src/database/database.service';
import {
  CreateUserRepositoryModel,
  UpdateUserRepositoryModel,
} from 'src/repository/models/user.models';

@Injectable()
export class UsersRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async createUser(data: CreateUserRepositoryModel): Promise<User> {
    try {
      const user = await this.databaseService.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
        },
      });
      return user;
    } catch (error: any) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === PRISMA_CLIENT_ERROR_CODES.PRISMA_CONFLICT) {
          throw new ConflictException(
            'Email already taken, Please try another one',
          );
        }
      } else if (error instanceof PrismaClientValidationError) {
        throw new BadRequestException(
          'Invalid data provided, please check your input',
        );
      }
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const users = (await this.databaseService.user.findMany()) as User[];
      return users;
    } catch (error) {
      throw error;
    }
  }

  async findUsersByIdEmailRole(
    id: string,
    email: string,
    role: Role,
  ): Promise<User[]> {
    try {
      const users = (await this.databaseService.user.findMany({
        where: {
          id: id,
          email: email,
          role: role,
        },
      })) as User[];
      return users;
    } catch (error) {
      throw error;
    }
  }

  async findUsersByIdAndEmail(id: string, email: string): Promise<User[]> {
    try {
      const users = (await this.databaseService.user.findMany({
        where: {
          id: id,
          email: email,
        },
      })) as User[];
      return users;
    } catch (error) {
      throw error;
    }
  }

  async findUsersByIdAndRole(id: string, role: Role): Promise<User[]> {
    try {
      const users = (await this.databaseService.user.findMany({
        where: {
          id: id,
          role: role,
        },
      })) as User[];
      return users;
    } catch (error) {
      throw error;
    }
  }

  async findUsersByEmailAndRole(email: string, role: Role): Promise<User[]> {
    try {
      const users = (await this.databaseService.user.findMany({
        where: {
          email: email,
          role: role,
        },
      })) as User[];
      return users;
    } catch (error) {
      throw error;
    }
  }

  async findUsersById(id: string): Promise<User[]> {
    try {
      const users = (await this.databaseService.user.findMany({
        where: {
          id: id,
        },
      })) as User[];
      return users;
    } catch (error) {
      throw error;
    }
  }

  async findUsersByEmail(email: string): Promise<User[]> {
    try {
      const users = (await this.databaseService.user.findMany({
        where: {
          email: email,
        },
      })) as User[];
      return users;
    } catch (error) {
      throw error;
    }
  }

  async findUsersByRole(role: Role): Promise<User[]> {
    try {
      const users = (await this.databaseService.user.findMany({
        where: {
          role: role,
        },
      })) as User[];
      return users;
    } catch (error) {
      throw error;
    }
  }

  async updateUserAccount(
    updateData: UpdateUserRepositoryModel,
    id: string,
  ): Promise<User> {
    try {
      const user = await this.databaseService.user.update({
        where: {
          id: id,
        },
        data: updateData,
      });

      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === PRISMA_CLIENT_ERROR_CODES.PRISMA_NOT_FOUND) {
          throw new ConflictException('User not found or already deleted');
        }
      }
      throw error;
    }
  }

  async deleteUserAccount(id: string): Promise<void> {
    try {
      const foundUser = await this.databaseService.user.findUnique({
        where: {
          id: id,
        },
      });

      if (!foundUser) {
        throw new BadRequestException('User not found');
      }

      await this.databaseService.user.delete({
        where: {
          id: id,
        },
      });

      return;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === PRISMA_CLIENT_ERROR_CODES.PRISMA_NOT_FOUND) {
          throw new ConflictException('User not found or already deleted');
        }
      }
      throw error;
    }
  }
}
