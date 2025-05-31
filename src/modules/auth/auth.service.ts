import { BadRequestException, Injectable } from '@nestjs/common';
import { SignUpUserRequesteDto } from 'src/dto/request/auth.request.dto';
import { UsersRepository } from '../users/users.repository';
import { isStringsEqual, normalizeEmail } from 'src/helpers/shared.helper';
import {
  passwordStrengthChecker,
  hashPassword,
  comparePassword,
} from 'src/helpers/auth-helper';
import { Role } from 'generated/prisma';
import { UserResponseDto } from 'src/dto/response/user.response.dto';
import { toUserResponseDto } from 'src/helpers/response-helper';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserResponseDto> {
    try {
      if (!email || !password) {
        throw new BadRequestException('Email and password are required');
      }

      const normalizedEmail = normalizeEmail(email);
      const users = await this.userRepository.findUsersByEmail(normalizedEmail);

      if (!users) {
        throw new BadRequestException('Ivalid Credentials');
      }

      const user = users[0]; // Assuming email is unique, we take the first user
      if (!user) {
        throw new BadRequestException('Ivalid Credentials');
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new BadRequestException('Invalid Credentials');
      }

      return toUserResponseDto(user);
    } catch (error) {
      throw error;
    }
  }

  async generateJwtToken(user: UserResponseDto): Promise<string> {
    try {
      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
      return await this.jwtService.sign(payload);
    } catch (error) {
      throw error;
    }
  }

  async createUser(data: SignUpUserRequesteDto): Promise<UserResponseDto> {
    try {
      if (!data) {
        throw new BadRequestException('Invalid user data');
      }

      if (
        !data.name ||
        !data.email ||
        !data.password ||
        !data.confirmPassword
      ) {
        throw new BadRequestException(
          'Name, email, password, and confirm password are required',
        );
      }

      if (!passwordStrengthChecker(data.password)) {
        throw new BadRequestException(
          'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        );
      }

      if (!isStringsEqual(data.password, data.confirmPassword)) {
        throw new BadRequestException('Passwords do not match');
      }

      const hashedPassword = await hashPassword(data.password);
      const normalizedEmail = normalizeEmail(data.email);

      const user = await this.userRepository.createUser({
        name: data.name,
        email: normalizedEmail,
        password: hashedPassword,
        role: Role.USER, // Default role is USER
      });

      const userResponse = toUserResponseDto(user);
      return userResponse;
    } catch (error) {
      throw error;
    }
  }
}
