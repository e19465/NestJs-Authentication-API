/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Role, User } from '@prisma/client';
import { UserResponseDto } from 'src/dto/response/user.response.dto';

/**
 * Transforms a user object into a UserResponseDto.
 * Validates required fields and throws an error if any are missing or invalid.
 *
 * @param user - The user object to transform.
 * @returns UserResponseDto
 * @throws Error if required fields are missing or invalid.
 */
export const toUserResponseDto = (user: User): UserResponseDto => {
  if (!user) {
    throw new Error('User object is required.');
  }
  if (typeof user.id !== 'string' && typeof user.id !== 'number') {
    throw new Error('User id is required and must be a string or number.');
  }
  if (typeof user.name !== 'string' || !user.name.trim()) {
    throw new Error('User name is required and must be a non-empty string.');
  }
  if (typeof user.email !== 'string' || !user.email.trim()) {
    throw new Error('User email is required and must be a non-empty string.');
  }
  if (!user.role) {
    throw new Error('User role is required.');
  }
  if (typeof user.isVerified !== 'boolean') {
    throw new Error('User isVerified is required and must be a boolean.');
  }
  if (!user.createdAt) {
    throw new Error('User createdAt is required.');
  }
  if (!user.updatedAt) {
    throw new Error('User updatedAt is required.');
  }

  // check role is correct type of Role enum from prisma
  if (!Object.values(Role).includes(user.role)) {
    throw new Error('User role must be a valid Role enum value.');
  }

  const userResponse: UserResponseDto = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
  return userResponse;
};
