import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';
import {
  GET_ACCOUNT_DETAILS_URL,
  LIST_ITEMS_IN_ONE_DRIVE_URL,
} from 'src/constants/microsoft.constants';
import {
  ListItemsInOneDriveResponseDto,
  MicrosoftAccountResponseDto,
} from 'src/dto/response/microsoft.response.dto';
import { TokenCryptoHelper } from 'src/helpers/token-crypto.helper';
import { UserMicrosoftCredentialRepository } from 'src/repository/microsoft.repository';
import { AuthService } from '../auth/auth.service';
import { CustomLoggerService } from 'src/custom-logger/custom-logger.service';

@Injectable()
export class MsGraphService {
  private readonly logger = new CustomLoggerService(MsGraphService.name);
  constructor(
    private readonly microsoftRepository: UserMicrosoftCredentialRepository,
    private readonly tokenCryptoHelper: TokenCryptoHelper,
    private readonly authService: AuthService,
  ) {}

  /**
   * Retrieves and decrypts Microsoft credentials (access and refresh tokens) for a given user from the database.
   *
   * @param userId - The unique identifier of the user whose credentials are to be retrieved.
   * @returns A promise that resolves to an object containing the decrypted access and refresh tokens.
   * @throws BadRequestException If no Microsoft credentials are found for the specified user.
   */
  private async getCredentialsFromDb(userId: string): Promise<{
    access: string;
    refresh: string;
  }> {
    const credentials =
      await this.microsoftRepository.retrieveCredentialsForUser(userId);
    if (!credentials) {
      throw new BadRequestException('No Microsoft credentials found for user');
    }

    const decrypteAccessToken = this.tokenCryptoHelper.decrypt(
      credentials.accessToken,
    );

    const decrypteRefreshToken = this.tokenCryptoHelper.decrypt(
      credentials.refreshToken,
    );

    return {
      access: decrypteAccessToken,
      refresh: decrypteRefreshToken,
    };
  }

  /**
   * Attempts to fetch data from the Microsoft Graph API using the provided access token.
   *
   * @param userId - The unique identifier of the user making the request.
   * @param url - The Microsoft Graph API endpoint URL to fetch data from.
   * @param token - The OAuth2 access token used for authentication with Microsoft Graph.
   * @returns A promise that resolves with the Axios response from the Microsoft Graph API.
   * @throws {UnauthorizedException} If the request to Microsoft Graph fails or the token is invalid.
   */
  private async tryMsGraphWithAccessToken(
    userId: string,
    url: string,
    token: string,
  ): Promise<any> {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response;
    } catch (error) {
      this.logger.error(
        `Error fetching data from Microsoft Graph for user ${userId}: ${error.message}`,
        MsGraphService.name,
        error.stack,
      );
      throw new UnauthorizedException(
        'Unable to retrieve Microsoft account data',
      );
    }
  }

  /**
   * Attempts to access the Microsoft Graph API using the stored access token for the specified user.
   * If the access token is invalid or expired, it tries to refresh the token and retries the request.
   *
   * @param userId - The unique identifier of the user whose Microsoft credentials are being used.
   * @param url - The Microsoft Graph API endpoint to be accessed.
   * @returns A promise that resolves with the response from the Microsoft Graph API.
   * @throws {UnauthorizedException} If unable to retrieve or refresh the Microsoft access token.
   */
  private async continueMsGraphWithTokenRefresh(
    userId: string,
    url: string,
  ): Promise<any> {
    try {
      const credentials = await this.getCredentialsFromDb(userId);
      const accessToken = credentials.access;
      if (!accessToken) {
        throw new UnauthorizedException(
          'Unable to retrieve access token for Microsoft account',
        );
      }

      const response = await this.tryMsGraphWithAccessToken(
        userId,
        url,
        accessToken,
      );

      return response;
    } catch (error) {
      try {
        const newAccessToken =
          await this.authService.refreshMicrosoftTokens(userId);
        if (!newAccessToken) {
          throw new UnauthorizedException(
            'Unable to refresh Microsoft access token',
          );
        }

        const newResponse = await this.tryMsGraphWithAccessToken(
          userId,
          url,
          newAccessToken,
        );

        return newResponse;
      } catch (refreshError) {
        this.logger.error(
          `Error refreshing Microsoft tokens for user ${userId}: ${refreshError.message}`,
          MsGraphService.name,
          refreshError.stack,
        );
        throw new UnauthorizedException(
          'Unable to refresh Microsoft access token',
        );
      }
    }
  }

  /**
   * Retrieves the Microsoft account details for a given user.
   *
   * This method attempts to fetch the Microsoft account information associated with the specified `userId`
   * by making a request to the Microsoft Graph API. If the access token is expired or invalid, it will
   * attempt to refresh the token and retry the request.
   *
   * @param userId - The unique identifier of the user whose Microsoft account details are to be retrieved.
   * @returns A promise that resolves to a `MicrosoftAccountResponseDto` containing the account details.
   * @throws Will throw an error if the request fails or if token refresh is unsuccessful.
   */
  async getMicrosoftAccount(
    userId: string,
  ): Promise<MicrosoftAccountResponseDto> {
    try {
      const url = GET_ACCOUNT_DETAILS_URL;
      const response = await this.continueMsGraphWithTokenRefresh(userId, url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves a list of items from the user's OneDrive using the Microsoft Graph API.
   *
   * @param userId - The unique identifier of the user whose OneDrive items are to be listed.
   * @returns A promise that resolves to a {@link ListItemsInOneDriveResponseDto} containing the list of OneDrive items.
   * @throws Will throw an error if the request to the Microsoft Graph API fails or if token refresh is unsuccessful.
   */
  async listItemsInOneDrive(
    userId: string,
  ): Promise<ListItemsInOneDriveResponseDto> {
    try {
      const url = LIST_ITEMS_IN_ONE_DRIVE_URL;
      const response = await this.continueMsGraphWithTokenRefresh(userId, url);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
