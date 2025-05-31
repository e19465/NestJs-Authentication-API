import {
  Body,
  Controller,
  Delete,
  Get,
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
import { Request } from 'express';
import { UserResponseDto } from 'src/dto/response/user.response.dto';
import { JwtSettings } from 'src/settings';
import {
  DecodedJwtAccessToken,
  JwtTokenResponseDto,
} from 'src/dto/response/auth.response.dto';
import { setCookieToResponse } from 'src/helpers/auth-helper';
import { AuthMicrosoftGuard } from 'src/guards/auth.microsoft.guard';
import { AuthJwtGuard } from 'src/guards/auth.jwt.guard';

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
  async loginUser(
    @Response({ passthrough: true }) response: any,
    @Req() request: Request,
  ) {
    try {
      const user = request.user as UserResponseDto;
      const tokens: JwtTokenResponseDto =
        await this.authService.generateJwtTokens(user);

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
    @Response({ passthrough: true }) response: any,
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
  async logoutUser(@Response({ passthrough: true }) response: any) {
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

  @Get('microsoft')
  @UseGuards(AuthMicrosoftGuard)
  async microsoftLogin() {
    // Redirection happens automatically
  }

  @Post('microsoft/obtain-tokens')
  @UseGuards(AuthJwtGuard)
  async getMicrosoftTokens(
    @Req() request: Request,
    @Body() data: { code: string },
  ) {
    try {
      const requestUser = request.user as DecodedJwtAccessToken;
      const userId = requestUser.id;
      const code = data.code;
      const serviceResponse = await this.authService.getMicrosoftTokens(
        code,
        userId,
      );
      return ApiResponse.success(
        null,
        'Microsoft tokens obtained successfully',
        serviceResponse,
        HttpStatus.OK,
      );
    } catch (error) {
      throw error;
    }
  }

  @Post('microsoft/refresh-microsoft-tokens')
  @UseGuards(AuthJwtGuard)
  async refreshMicrosoftTokens(@Req() request: Request) {
    try {
      const requestUser = request.user as DecodedJwtAccessToken;
      const userId = requestUser.id;
      const serviceResponse =
        await this.authService.refreshMicrosoftTokens(userId);
      return ApiResponse.success(
        null,
        'Microsoft tokens refreshed successfully',
        serviceResponse,
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
 * GET    <base_url>/auth/microsoft -> Redirect to Microsoft OAuth login
 * POST    <base_url>/auth/microsoft/obtain-tokens/ -> Obtain Microsoft tokens using the authorization code
 * POST    <base_url>/auth/microsoft/refresh-microsoft-tokens/ -> Refresh Microsoft tokens
 */
