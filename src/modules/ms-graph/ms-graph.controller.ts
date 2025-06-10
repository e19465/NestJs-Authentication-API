import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthJwtGuard } from 'src/guards/auth.jwt.guard';
import { MsGraphService } from './ms-graph.service';
import { ApiResponse } from 'src/helpers/api-response.helper';
import { Request } from 'express';
import { DecodedJwtAccessToken } from 'src/dto/response/auth.response.dto';
import { AuthMicrosoftGuard } from 'src/guards/auth.microsoft.guard';
import { EmailFromOutlookDto } from 'src/types/microsoft';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('ms-graph')
export class MsGraphController {
  constructor(private readonly msGraphService: MsGraphService) {}

  @Get('authenticate')
  @UseGuards(AuthMicrosoftGuard)
  async microsoftLoginHtml() {
    // This returns HTML page. when authentication is successful,
    // Redirection happens automatically
  }

  @Get('auth/login')
  microsoftLoginUrl(@Query('redirect') redirect?: string) {
    try {
      const redirectUri = this.msGraphService.getMicrosoftRedirectUri(redirect);
      return ApiResponse.success(
        null,
        'Microsoft Login Redirect URI obtain successfull',
        { redirectUri },
        HttpStatus.OK,
      );
    } catch (error) {
      throw error;
    }
  }

  @Post('auth/obtain-tokens')
  @UseGuards(AuthJwtGuard)
  async getMicrosoftTokens(
    @Req() request: Request,
    @Body()
    data: {
      code: string;
    },
  ) {
    try {
      const requestUser = request.user as DecodedJwtAccessToken;
      const userId = requestUser.id;
      const code = data.code;
      const serviceResponse = await this.msGraphService.getMicrosoftTokens(
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

  @Post('auth/obtain-tokens-outlook-plugin')
  async getMicrosoftTokensForOutlook(
    @Body()
    data: {
      code: string;
      redirect: string;
    },
  ) {
    try {
      const code = data.code;
      const redirect = data.redirect;
      const serviceResponse =
        await this.msGraphService.getMicrosoftTokensForOutlookPlugin(
          code,
          redirect,
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

  @Post('auth/refresh-microsoft-tokens')
  @UseGuards(AuthJwtGuard)
  async refreshMicrosoftTokens(@Req() request: Request) {
    try {
      const requestUser = request.user as DecodedJwtAccessToken;
      const userId = requestUser.id;
      await this.msGraphService.refreshMsTokens(userId);
      return ApiResponse.success(
        null,
        'Microsoft tokens refreshed successfully',
        null,
        HttpStatus.OK,
      );
    } catch (error) {
      throw error;
    }
  }

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

  @Delete('auth/disconnect-microsoft-account')
  @UseGuards(AuthJwtGuard)
  async disconnectMicrosoftAccount(@Req() request: Request) {
    try {
      const user = request.user as DecodedJwtAccessToken;
      await this.msGraphService.disconnectMicrosoftAccount(user.id);
      return ApiResponse.success(
        null,
        'Microsoft account disconnected successfully',
        null,
        HttpStatus.OK,
      );
    } catch (error) {
      throw error;
    }
  }

  @Post('upload-email-to-cloud')
  @UseInterceptors(FilesInterceptor('attachments'))
  receiveEmail(
    @Body() bodyDate: EmailFromOutlookDto,
    @UploadedFiles() attachments: Express.Multer.File[],
  ) {
    try {
      this.msGraphService.handleIncomingEmail(bodyDate, attachments);
      return ApiResponse.success(null, 'Email received', null, HttpStatus.OK);
    } catch (error) {
      throw error;
    }
  }
}

/**
 * Full Endpoints List
 *
 * GET <base_url>/ms-graph/authenticate -> Authenticate with Microsoft
 * POST <base_url>/ms-graph/auth/obtain-tokens -> Obtain Microsoft tokens using the authorization code
 * POST <base_url>/ms-graph/auth/refresh-microsoft-tokens -> Refresh Microsoft tokens for the authenticated user
 * GET <base_url>/ms-graph/get-microsoft-account -> Get Microsoft account details for the authenticated user
 * GET <base_url>/ms-graph/list-one-drive-items -> List items in OneDrive for the authenticated user
 */
