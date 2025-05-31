import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { SignUpUserRequesteDto } from 'src/dto/request/auth.request.dto';
import { AuthService } from './auth.service';
import { ApiResponse } from 'src/helpers/api-response.helper';

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
}
