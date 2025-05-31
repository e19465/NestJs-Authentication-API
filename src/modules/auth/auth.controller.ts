import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SignUpUserRequesteDto } from 'src/dto/request/auth.request.dto';
import { AuthService } from './auth.service';
import { ApiResponse } from 'src/helpers/api-response.helper';
import { AuthLocalGuard } from 'src/guards/auth.local.guard';
import { Request } from 'express';
import { UserResponseDto } from 'src/dto/response/user.response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up') // POST - /users/create
  async createUser(@Body() data: SignUpUserRequesteDto) {
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
  async loginUser(@Req() request: Request) {
    try {
      const user = request.user as UserResponseDto;
      const token = await this.authService.generateJwtToken(user);
      return ApiResponse.success(
        null,
        'Login successful',
        token,
        HttpStatus.OK,
      );
    } catch (error) {
      throw error;
    }
  }
}
