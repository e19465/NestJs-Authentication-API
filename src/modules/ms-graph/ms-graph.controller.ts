import { Controller, Get, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { AuthJwtGuard } from 'src/guards/auth.jwt.guard';
import { MsGraphService } from './ms-graph.service';
import { ApiResponse } from 'src/helpers/api-response.helper';
import { Request } from 'express';
import { DecodedJwtAccessToken } from 'src/dto/response/auth.response.dto';

@Controller('ms-graph')
export class MsGraphController {
  constructor(private readonly msGraphService: MsGraphService) {}

  @Get('get-microsoft-account')
  @UseGuards(AuthJwtGuard)
  async getMicrosoftAccount(@Req() request: Request) {
    try {
      const user = request.user as DecodedJwtAccessToken;
      const account = await this.msGraphService.getMicrosoftAccount(user.id);
      return ApiResponse.success(
        null,
        'Microsoft Account Received Successfully',
        account,
        HttpStatus.OK,
      );
    } catch (error) {
      throw error;
    }
  }

  @Get('list-one-drive-items')
  @UseGuards(AuthJwtGuard)
  async listItemsInOneDrive(@Req() request: Request) {
    try {
      const user = request.user as DecodedJwtAccessToken;
      const data = await this.msGraphService.listItemsInOneDrive(user.id);
      return ApiResponse.success(
        null,
        'Files list fetched successfully',
        data,
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
 * GET <base_url>/ms-graph/get-microsoft-account -> Get Microsoft account details for the authenticated user
 * GET <base_url>/ms-graph/list-one-drive-items -> List items in OneDrive for the authenticated user
 */
