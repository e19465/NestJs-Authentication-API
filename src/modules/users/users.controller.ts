import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Query,
  Response,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserRequesteDto } from 'src/dto/request/user.request.dto';
import { ApiResponse } from 'src/helpers/api-response.helper';
////////////////////////////////////////////////////////////////////////////////////////////////////

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('get-all') // GET - /users/get-all
  async getAllUsers(
    @Response({ passthrough: true }) response: any,
    @Query('role') role?: string,
  ) {
    try {
      const serviceResponse = await this.usersService.getAllUsers();
      return ApiResponse.success(
        null,
        'Users fetched successfully',
        serviceResponse,
        HttpStatus.OK,
      );
    } catch (error) {
      throw error;
    }
  }

  @Get('find') // GET - /users/get-one/?id={id}&email={email}&role={role}
  async getOneUser(
    @Query('id') id?: string,
    @Query('email') email?: string,
    @Query('role') role?: string,
  ) {
    try {
      const serviceResponse = await this.usersService.findUsers(
        id,
        email,
        role,
      );
      return ApiResponse.success(
        null,
        'User fetched successfully',
        serviceResponse,
        HttpStatus.OK,
      );
    } catch (error) {
      throw error;
    }
  }

  @Patch('update-one/:id') // POST - /users/:id
  async updateUser(
    @Param('id') id: string,
    @Body() data: UpdateUserRequesteDto,
  ) {
    try {
      const serviceResponse = await this.usersService.updateUser(id, data);
      return ApiResponse.success(
        null,
        'User updated successfully',
        serviceResponse,
        HttpStatus.OK,
      );
    } catch (error) {
      throw error;
    }
  }

  @Delete('delete-one/:id') // POST - /users/:id/delete
  async deleteUser(@Param('id') id: string) {
    try {
      await this.usersService.deleteUser(id);
      return ApiResponse.success(
        null,
        'User deleted successfully',
        null,
        HttpStatus.NO_CONTENT,
      );
    } catch (error) {
      throw error;
    }
  }
}

/**
 * Full Endpoints List
 *
 * GET    <base_url>/users/get-all -> Returns list of users
 * GET    <base_url>/users/get-one/:id -> Returns one user
 * PATCH  <base_url>/users/update-one/:id -> Updates an user
 * DELETE <base_url>/users/delete-one/:id -> Delete an user
 */
