import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Post,
  Req,
  Response,
  UseGuards,
} from '@nestjs/common';
import {
  RefreshTokenRequestDto,
  SignUpUserRequesteDto,
} from 'src/dto/request/auth.request.dto';
import { AuthService } from './auth.service';
import { ApiResponse } from 'src/helpers/api-response.helper';
import { AuthLocalGuard } from 'src/guards/auth.local.guard';
import { Request, Response as ExpressResponse } from 'express';
import { UserResponseDto } from 'src/dto/response/user.response.dto';
import { JwtSettings } from 'src/settings';
import { JwtTokenResponseDto } from 'src/dto/response/auth.response.dto';
import { setCookieToResponse } from 'src/helpers/auth-helper';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up') // POST - /users/create
  async registerUser(@Body() data: SignUpUserRequesteDto) {
    try {
      const serviceResponse = await this.authService.createUser(data);
      return ApiResponse.success(
        null,
        'User created successfully',
        serviceResponse,
        HttpStatus.CREATED,
      );
    } catch (error) {
      throw error;
    }
  }

  @Post('sign-in') // POST - /users/sign-in
  @UseGuards(AuthLocalGuard)
  loginUser(
    @Response({ passthrough: true }) response: ExpressResponse,
    @Req() request: Request,
  ) {
    try {
      const user = request.user as UserResponseDto;
      const tokens: JwtTokenResponseDto =
        this.authService.generateJwtTokens(user);

      setCookieToResponse(
        'access',
        response,
        tokens.access,
        JwtSettings.accessCookieExpiresIn,
      );

      setCookieToResponse(
        'refresh',
        response,
        tokens.refresh,
        JwtSettings.refreshCookieExpiresIn,
      );

      return ApiResponse.success(
        response,
        'Login successful',
        tokens,
        HttpStatus.OK,
      );
    } catch (error) {
      throw error;
    }
  }

  @Post('refresh') // POST - /auth/refresh
  async refreshTokens(
    @Response({ passthrough: true }) response: ExpressResponse,
    @Body() body: RefreshTokenRequestDto,
  ) {
    try {
      const tokens: JwtTokenResponseDto =
        await this.authService.refreshJwtTokens(body.token);

      setCookieToResponse(
        'access',
        response,
        tokens.access,
        JwtSettings.accessCookieExpiresIn,
      );

      setCookieToResponse(
        'refresh',
        response,
        tokens.refresh,
        JwtSettings.refreshCookieExpiresIn,
      );

      return ApiResponse.success(
        response,
        'Tokens refreshed successfully',
        tokens,
        HttpStatus.OK,
      );
    } catch (error) {
      throw error;
    }
  }

  @Delete('sign-out') // POST - /auth/sign-out
  logoutUser(@Response({ passthrough: true }) response: ExpressResponse) {
    try {
      // Clear cookies
      response.clearCookie('access');
      response.clearCookie('refresh');

      return ApiResponse.success(
        response,
        'Logout successful',
        null,
        HttpStatus.OK,
      );
    } catch (error) {
      throw error;
    }
  }
}

/**
 * Full Endpoints List
 *
 * POST   <base_url>/auth/sign-up   -> Register a new user
 * POST   <base_url>/auth/sign-in   -> Login user and generate JWT tokens
 * POST   <base_url>/auth/refresh   -> Refresh JWT tokens using a valid refresh token
 * DELETE <base_url>/auth/sign-out  -> Logout user and clear cookies
 */
