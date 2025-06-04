import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpUserRequesteDto } from 'src/dto/request/auth.request.dto';
import { UsersRepository } from '../../repository/users.repository';
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
import { JwtSettings } from 'src/settings';
import { JwtTokenResponseDto } from 'src/dto/response/auth.response.dto';
import { JwtPayload } from 'src/types/auth';

/**
 * AuthService provides authentication and user management functionalities.
 *
 * Methods:
 * - validateUser(email: string, password: string): Promise<UserResponseDto>
 * - generateJwtTokens(user: UserResponseDto): Promise<JwtTokenResponseDto>
 * - refreshJwtTokens(refreshToken: string): Promise<JwtTokenResponseDto>
 * - createUser(data: SignUpUserRequesteDto): Promise<UserResponseDto>
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validates a user's credentials.
   * Checks if the provided email and password are valid and match an existing user.
   * Throws BadRequestException if credentials are invalid or missing.
   *
   * @param email - The user's email address.
   * @param password - The user's password.
   * @returns A promise that resolves to a UserResponseDto if validation is successful.
   * @throws BadRequestException if credentials are invalid or missing.
   */
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

  /**
   * Generates JWT access and refresh tokens for a user.
   * Uses the user's id, email, and role as the payload.
   *
   * @param user - The user for whom to generate tokens.
   * @returns A promise that resolves to a JwtTokenResponseDto containing access and refresh tokens.
   */
  generateJwtTokens(user: UserResponseDto): JwtTokenResponseDto {
    try {
      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = this.jwtService.sign(payload, {
        secret: JwtSettings.accessTokenSecret,
        expiresIn: JwtSettings.accessTokenExpiresIn,
      });

      const refreshToken = this.jwtService.sign(payload, {
        secret: JwtSettings.refreshTokenSecret,
        expiresIn: JwtSettings.refreshTokenExpiresIn,
      });

      return {
        access: accessToken,
        refresh: refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refreshes JWT tokens using a valid refresh token.
   * Verifies the refresh token and generates new access and refresh tokens.
   * Throws UnauthorizedException if the token is invalid or expired.
   *
   * @param refreshToken - The refresh token to verify and use for generating new tokens.
   * @returns A promise that resolves to a JwtTokenResponseDto with new tokens.
   * @throws UnauthorizedException if the refresh token is invalid or expired.
   */
  async refreshJwtTokens(refreshToken: string): Promise<JwtTokenResponseDto> {
    try {
      const payload: JwtPayload = this.jwtService.verify(refreshToken, {
        secret: JwtSettings.refreshTokenSecret,
      });
      const users = await this.userRepository.findUsersById(payload.id);
      if (!users) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }
      const user = users[0];
      if (!user) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }
      return this.generateJwtTokens(toUserResponseDto(user));
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Creates a new user with the provided data.
   * Validates input, checks password strength, and ensures passwords match.
   * Hashes the password before saving the user.
   * Throws BadRequestException for invalid input or weak passwords.
   *
   * @param data - The sign-up data for the new user.
   * @returns A promise that resolves to a UserResponseDto for the created user.
   * @throws BadRequestException for invalid input or weak passwords.
   */
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
