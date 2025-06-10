import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import {
  MS_GRAPH_GET_ACCOUNT_DETAILS_URL,
  MS_GRAPH_LIST_ITEMS_IN_ONE_DRIVE_URL,
  MS_GRAPH_TOKEN_URL,
} from 'src/constants/microsoft.constants';
import {
  ListItemsInOneDriveResponseDto,
  MicrosoftAccountResponseDto,
} from 'src/dto/response/microsoft.response.dto';
import { TokenCryptoHelper } from 'src/helpers/token-crypto.helper';
import { UserMicrosoftCredentialRepository } from 'src/repository/microsoft.repository';
import { CustomLoggerService } from 'src/custom-logger/custom-logger.service';
import { MicrosoftSettings } from 'src/settings';
import {
  StoreMicrosoftCredentialsOutlookRepositoryModel,
  StoreMicrosoftCredentialsRepositoryModel,
} from 'src/repository/models/microsoft.models';
import { MicrosoftJwtTokenResponse } from 'src/types/microsoft';

@Injectable()
export class MsGraphService {
  private readonly logger = new CustomLoggerService(MsGraphService.name);
  constructor(
    private readonly microsoftRepository: UserMicrosoftCredentialRepository,
    private readonly tokenCryptoHelper: TokenCryptoHelper,
  ) {}

  /**
   * Refreshes the Microsoft OAuth tokens for a given user.
   *
   * This method retrieves the stored Microsoft credentials for the specified user,
   * decrypts the refresh token, and requests new tokens from the Microsoft OAuth endpoint.
   * The new access, refresh, and ID tokens are encrypted and stored back in the repository.
   * Returns the new access token.
   *
   * @param userId - The unique identifier of the user whose tokens are to be refreshed.
   * @returns A promise that resolves to the new access token and refresh tokens as strings.
   * @throws {BadRequestException} If no Microsoft credentials are found for the user.
   * @throws {UnauthorizedException} If the token refresh process fails.
   */
  private async refreshMicrosoftTokens(userId: string): Promise<{
    access: string;
    refresh: string;
    id_token: string;
  }> {
    try {
      const credentials =
        await this.microsoftRepository.retrieveCredentialsForUser(userId);
      if (!credentials) {
        throw new BadRequestException(
          'No Microsoft credentials found for user',
        );
      }

      const decryptedRefreshToken = this.tokenCryptoHelper.decrypt(
        credentials.refreshToken,
      );

      const tokenUrl = MS_GRAPH_TOKEN_URL;

      const params = new URLSearchParams({
        client_id: MicrosoftSettings.clientID ?? '',
        scope: MicrosoftSettings.scope.join(' '),
        refresh_token: decryptedRefreshToken ?? '',
        grant_type: 'refresh_token',
        client_secret: MicrosoftSettings.clientSecret ?? '',
      });

      const response = await axios.post(tokenUrl, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const data = response.data as MicrosoftJwtTokenResponse;

      const accessToken = data.access_token;
      const refreshToken = data.refresh_token;
      const idToken = data.id_token;

      const newCredentials: StoreMicrosoftCredentialsRepositoryModel = {
        userId: userId,
        accessToken: this.tokenCryptoHelper.encrypt(accessToken),
        refreshToken: this.tokenCryptoHelper.encrypt(refreshToken),
        idToken: this.tokenCryptoHelper.encrypt(idToken),
      };

      await this.microsoftRepository.storeMicrosoftCredentials(newCredentials);
      return {
        access: accessToken,
        refresh: refreshToken,
        id_token: idToken,
      };
    } catch (error: any) {
      throw new UnauthorizedException(
        'Failed to refresh Microsoft tokens: ' + error,
      );
    }
  }

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
      throw new BadRequestException(
        "Unable to find the user's microsoft account. Please sign in again",
      );
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
    userId: string | null = null,
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
    } catch (err) {
      this.logger.error(
        `Error fetching data from Microsoft Graph for user ${userId}`,
        MsGraphService.name,
        (err as Error).stack || err,
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
    let accessToken: string | null = null;

    try {
      const credentials = await this.getCredentialsFromDb(userId);
      accessToken = credentials.access;
      if (!accessToken) {
        throw new UnauthorizedException(
          'Unable to retrieve access token for Microsoft account',
        );
      }
    } catch (error) {
      throw error;
    }

    if (!accessToken) {
      throw new UnauthorizedException(
        'Unable to find the credentials for microsoft account. Please sign in again',
      );
    }

    try {
      const response = (await this.tryMsGraphWithAccessToken(
        userId,
        url,
        accessToken,
      )) as AxiosResponse;

      return response;
    } catch {
      try {
        const tokenResponse = await this.refreshMicrosoftTokens(userId);
        const newAccessToken = tokenResponse.access;
        if (!newAccessToken) {
          throw new UnauthorizedException(
            'Unable to refresh Microsoft access token',
          );
        }

        const newResponse = (await this.tryMsGraphWithAccessToken(
          userId,
          url,
          newAccessToken,
        )) as AxiosResponse;

        return newResponse;
      } catch (refreshError) {
        this.logger.error(
          `Error refreshing Microsoft tokens for user ${userId}: ${
            (refreshError as Error).message
          }`,
          MsGraphService.name,
          (refreshError as Error).stack || refreshError,
        );
        throw new UnauthorizedException(
          'Unable to refresh Microsoft access token',
        );
      }
    }
  }

  private async getTokensFromMicrosoftForLogin(
    code: string,
    redirect: string,
  ): Promise<MicrosoftJwtTokenResponse> {
    try {
      const tokenUrl = MS_GRAPH_TOKEN_URL;

      const params = new URLSearchParams({
        client_id: MicrosoftSettings.clientID ?? '',
        scope: MicrosoftSettings.scope.join(' '),
        code: code,
        redirect_uri: redirect,
        grant_type: 'authorization_code',
        client_secret: MicrosoftSettings.clientSecret ?? '',
      });

      const response = await axios.post(tokenUrl, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const data = response.data as MicrosoftJwtTokenResponse;
      return data;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Constructs and returns the Microsoft OAuth2 authorization redirect URI.
   *
   * This method builds the URL that the client should use to initiate the Microsoft OAuth2
   * authentication flow. It includes all required query parameters such as client_id, response_type,
   * redirect_uri, response_mode, and scope, using the values defined in MicrosoftSettings.
   *
   * @returns {string} The full Microsoft OAuth2 authorization URL with query parameters.
   */
  getMicrosoftRedirectUri(redirect?: string): string {
    const redirectUrl = redirect
      ? redirect
      : MicrosoftSettings.redirectUrl
        ? MicrosoftSettings.redirectUrl
        : '';

    const params = new URLSearchParams({
      client_id: MicrosoftSettings.clientID ?? '',
      response_type: MicrosoftSettings.responseType,
      redirect_uri: redirectUrl,
      response_mode: MicrosoftSettings.responseMode,
      scope: MicrosoftSettings.scope.join(' '),
    });
    return `${MicrosoftSettings.loginUrl}?${params.toString()}`;
  }

  async getMicrosoftTokens(code: string, userId: string): Promise<void> {
    try {
      const data: MicrosoftJwtTokenResponse =
        await this.getTokensFromMicrosoftForLogin(
          code,
          MicrosoftSettings.redirectUrl,
        );

      const accessToken = data.access_token;
      const refreshToken = data.refresh_token;
      const idToken = data.id_token;

      const credentials: StoreMicrosoftCredentialsRepositoryModel = {
        userId: userId,
        accessToken: this.tokenCryptoHelper.encrypt(accessToken),
        refreshToken: this.tokenCryptoHelper.encrypt(refreshToken),
        idToken: this.tokenCryptoHelper.encrypt(idToken),
      };

      await this.microsoftRepository.storeMicrosoftCredentials(credentials);
      return;
    } catch (error: any) {
      this.logger.error(
        `Error obtaining Microsoft tokens for user`,
        MsGraphService.name,
        (error as Error).stack || error,
      );
      throw new UnauthorizedException(
        'Failed to obtain tokens from Microsoft: ' + error,
      );
    }
  }

  async getMicrosoftTokensForOutlookPlugin(
    code: string,
    redirect: string,
  ): Promise<{
    email: string;
  }> {
    try {
      const data: MicrosoftJwtTokenResponse =
        await this.getTokensFromMicrosoftForLogin(code, redirect);

      const accessToken = data.access_token;
      const refreshToken = data.refresh_token;
      const idToken = data.id_token;

      const url = MS_GRAPH_GET_ACCOUNT_DETAILS_URL;

      const response_account = (await this.tryMsGraphWithAccessToken(
        null,
        url,
        accessToken,
      )) as AxiosResponse;
      const account_data = response_account.data as MicrosoftAccountResponseDto;

      const credentials: StoreMicrosoftCredentialsOutlookRepositoryModel = {
        email: account_data.userPrincipalName,
        accessToken: this.tokenCryptoHelper.encrypt(accessToken),
        refreshToken: this.tokenCryptoHelper.encrypt(refreshToken),
        idToken: this.tokenCryptoHelper.encrypt(idToken),
      };

      await this.microsoftRepository.storeMicrosoftCredentialsOutlook(
        credentials,
      );
      return {
        email: account_data.userPrincipalName,
      };
    } catch (error: any) {
      this.logger.error(
        `Error obtaining Microsoft tokens for user for outlook plugin`,
        MsGraphService.name,
        (error as Error).stack || error,
      );
      throw new UnauthorizedException(
        'Failed to obtain tokens from Microsoft: ' + error,
      );
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
      const url = MS_GRAPH_GET_ACCOUNT_DETAILS_URL;
      const response = (await this.continueMsGraphWithTokenRefresh(
        userId,
        url,
      )) as AxiosResponse;
      const data = response.data as MicrosoftAccountResponseDto;
      return data;
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
      const url = MS_GRAPH_LIST_ITEMS_IN_ONE_DRIVE_URL;
      const response = (await this.continueMsGraphWithTokenRefresh(
        userId,
        url,
      )) as AxiosResponse;
      const data = response.data as ListItemsInOneDriveResponseDto;
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refreshes the Microsoft authentication tokens for a given user.
   *
   * @param userId - The unique identifier of the user whose Microsoft tokens need to be refreshed.
   * @returns A promise that resolves with the refreshed token response.
   * @throws Rethrows any error encountered during the token refresh process.
   */
  async refreshMsTokens(userId: string): Promise<void> {
    try {
      await this.refreshMicrosoftTokens(userId);
      return;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Disconnects a user's Microsoft account by deleting their Microsoft credentials.
   *
   * @param userId - The unique identifier of the user whose Microsoft account should be disconnected.
   * @returns A promise that resolves when the credentials have been deleted.
   * @throws Will rethrow any error encountered during the deletion process.
   */
  async disconnectMicrosoftAccount(userId: string): Promise<void> {
    try {
      await this.microsoftRepository.deleteMicrosoftCredentials(userId);
      return;
    } catch (error) {
      throw error;
    }
  }
}
