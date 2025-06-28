import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import {
  CUSTOM_MS_ERROR_CODES_FOR_PLUGIN,
  get_CHECK_FOLDER_EXISTENCE_BY_NAME_URL,
  get_CREATE_FOLDER_URL,
  get_EMAIL_UPLOAD_URL,
  get_FILE_UPLOAD_URL,
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
import { StoreMicrosoftCredentialsRepositoryModel } from 'src/repository/models/microsoft.models';
import {
  MicrosoftCredentialsStoreData,
  MicrosoftJwtTokenResponse,
} from 'src/types/microsoft';
import { EmailFromOutlookDto } from 'src/dto/request/ms-graph.request.dto';
import { UsersService } from '../users/users.service';
import { UserResponseDto } from 'src/dto/response/user.response.dto';
import { v4 as uuidv4 } from 'uuid';
import { createOutlookEmailTemplate } from 'src/helpers/email-template.helper';
import { normalizeDate } from 'src/helpers/shared.helper';

@Injectable()
export class MsGraphService {
  private readonly logger = new CustomLoggerService(MsGraphService.name);
  constructor(
    private readonly microsoftRepository: UserMicrosoftCredentialRepository,
    private readonly tokenCryptoHelper: TokenCryptoHelper,
    private readonly usersService: UsersService,
  ) {}

  private async getUserFromEmailOrUserId(
    email: string | null = null,
    userId: string | null = null,
  ): Promise<UserResponseDto | null> {
    try {
      let users: UserResponseDto[] = [];
      if (email) {
        users = await this.usersService.findUsers(undefined, email, undefined);
      } else if (userId) {
        users = await this.usersService.findUsers(userId, undefined, undefined);
      }
      if (!users || users.length == 0) {
        return null;
      }
      return users[0];
    } catch (error) {
      throw error;
    }
  }

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
   * Sends an HTTP request to the Microsoft Graph API using the provided access token.
   *
   * @param userId - The user ID associated with the request, or `null` if not applicable.
   * @param url - The Microsoft Graph API endpoint URL.
   * @param token - The OAuth 2.0 access token to authorize the request.
   * @param contentType - The value for the `Content-Type` header. Defaults to `'application/json'`.
   * @param method - The HTTP method to use for the request. Defaults to `'GET'`.
   * @param data - The request payload for methods that support a body (e.g., `POST`, `PUT`, `PATCH`).
   * @returns A promise that resolves with the Axios response object from the Microsoft Graph API.
   * @throws {UnauthorizedException} If the request fails or the response is unauthorized.
   *
   * @remarks
   * This method logs errors and throws a NestJS `UnauthorizedException` if the request fails.
   * It supports `GET`, `POST`, `PUT`, `PATCH`, and `DELETE` HTTP methods.
   */
  private async tryMsGraphWithAccessToken(
    userId: string | null = null,
    url: string,
    token: string,
    contentType: string | null = 'application/json',
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
    data?: any,
  ): Promise<any> {
    try {
      let response;
      if (method == 'GET') {
        response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': contentType,
          },
        });
      } else if (method == 'POST') {
        if (data) {
          response = await axios.post(url, data, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': contentType,
            },
          });
        }
      } else if (method == 'PUT') {
        if (data) {
          response = await axios.put(url, data, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': contentType,
            },
          });
        }
      } else if (method == 'PATCH') {
        if (data) {
          response = await axios.patch(url, data, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': contentType,
            },
          });
        }
      } else {
        response = await axios.delete(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': contentType,
          },
        });
      }
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
   * Attempts to perform a Microsoft Graph API request using the user's access token.
   * If the access token is expired or invalid, it tries to refresh the token and retries the request.
   *
   * @param userId - The unique identifier of the user whose Microsoft credentials are used.
   * @param url - The Microsoft Graph API endpoint to call.
   * @param method - The HTTP method to use for the request (default is 'GET').
   * @param contentType - Optional content type for the request (e.g., 'application/json').
   * @param data - Optional data payload to send with the request (for POST, PUT, PATCH).
   * @returns A promise that resolves with the Axios response from the Microsoft Graph API.
   * @throws {UnauthorizedException} If unable to retrieve or refresh the access token, or if credentials are missing.
   */
  private async continueMsGraphWithTokenRefresh(
    userId: string,
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
    contentType?: string,
    data?: any,
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
        contentType,
        method,
        data,
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
          contentType,
          method,
          data,
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

  /**
   * Exchanges an authorization code for Microsoft OAuth tokens.
   *
   * This method sends a POST request to the Microsoft Graph token endpoint with the provided
   * authorization code and redirect URI, along with client credentials and requested scopes.
   * It returns the token response containing access, refresh, and ID tokens.
   *
   * @param code - The authorization code received from Microsoft after user login.
   * @param redirect - The redirect URI used in the OAuth flow.
   * @returns A promise that resolves to a {@link MicrosoftJwtTokenResponse} containing the tokens.
   * @throws Throws an error if the token exchange fails.
   */
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
   * Creates a folder in the user's OneDrive if it does not already exist, and returns the folder's ID.
   *
   * This method first checks if a folder with the specified name exists in the user's OneDrive.
   * If the folder exists, its ID is returned. If not, a new folder is created with the given name,
   * and the ID of the newly created folder is returned.
   *
   * @param userId - The unique identifier of the user whose OneDrive is being accessed.
   * @param folderName - The name of the folder to check for or create.
   * @returns A promise that resolves to the ID of the existing or newly created folder.
   * @throws Will throw an error if the Microsoft Graph API requests fail.
   */
  private async createFolderInOneDriveIfNotExists(
    userId: string,
    folderName: string,
  ): Promise<string> {
    try {
      let folderId: string;

      const folderRes = (await this.continueMsGraphWithTokenRefresh(
        userId,
        get_CHECK_FOLDER_EXISTENCE_BY_NAME_URL(folderName),
        'GET',
        undefined,
        null,
      )) as AxiosResponse;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      const existingFolder = folderRes?.data?.value?.find(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
        (item: any) => item?.name === folderName && item?.folder,
      );

      if (existingFolder) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        folderId = existingFolder?.id;
      } else {
        const createdFolder = (await this.continueMsGraphWithTokenRefresh(
          userId,
          get_CREATE_FOLDER_URL(),
          'POST',
          undefined,
          {
            name: folderName,
            folder: {},
            '@microsoft.graph.conflictBehavior': 'rename',
          },
        )) as AxiosResponse;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        folderId = createdFolder?.data?.id;
      }

      return folderId;
    } catch (error) {
      console.error('Error creating folder in OneDrive:', error);
      throw new Error('Failed to create or retrieve folder in OneDrive');
    }
  }

  /**
   * Uploads multiple files to a specified folder in the user's OneDrive.
   *
   * - Checks if the target folder exists in OneDrive; creates it if it does not.
   * - Uploads each file to the folder.
   * - Returns an array of public-facing URLs for the uploaded files.
   *
   * @param userId - The unique identifier of the user whose OneDrive will be accessed.
   * @param files - An array of files to upload, each conforming to the Express.Multer.File interface.
   * @param folderName - The name of the folder in OneDrive where files will be uploaded.
   * @returns A promise that resolves to an array of URLs for the uploaded files.
   * @throws Throws an error if the upload process fails.
   */
  private async uploadFilesToOneDrive(
    userId: string,
    files: Express.Multer.File[],
    folderName: string,
  ): Promise<string[]> {
    try {
      // 1. Check if folder exists
      const folderId = await this.createFolderInOneDriveIfNotExists(
        userId,
        folderName,
      );

      // 3. Upload each file to the folder
      const uploadedUrls: string[] = [];

      for (const file of files) {
        console.log('file type: ', file.mimetype);
        const uploadRes = (await this.continueMsGraphWithTokenRefresh(
          userId,
          get_FILE_UPLOAD_URL(folderId, file.originalname),
          'PUT',
          file.mimetype,
          file.buffer,
        )) as AxiosResponse;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        uploadedUrls.push(uploadRes?.data?.webUrl); // Return public-facing URLs
      }

      return uploadedUrls;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  }

  /**
   * Saves Microsoft credentials in the database after encrypting sensitive tokens.
   *
   * @param data - An object containing the user's Microsoft credentials to be stored.
   * @returns A promise that resolves when the credentials have been successfully saved.
   * @throws Rethrows any error encountered during the encryption or storage process.
   */
  private async saveMicrosoftCredentialsInDB(
    data: MicrosoftCredentialsStoreData,
  ): Promise<void> {
    try {
      const credentials: StoreMicrosoftCredentialsRepositoryModel = {
        userId: data.userId,
        accessToken: this.tokenCryptoHelper.encrypt(data.accessToken),
        refreshToken: this.tokenCryptoHelper.encrypt(data.refreshToken),
        idToken: this.tokenCryptoHelper.encrypt(data.idToken),
      };
      await this.microsoftRepository.storeMicrosoftCredentials(credentials);
    } catch (error) {
      throw error;
    }
  }

  //! ------------ END OF PRIVATE METHODS, BEGIN PUBLIC METHODS ------------ !//

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

  /**
   * Exchanges an authorization code for Microsoft OAuth tokens and stores them in the database.
   *
   * @param code - The authorization code received from Microsoft OAuth flow.
   * @param userId - The unique identifier of the user for whom the tokens are being obtained.
   * @returns A promise that resolves when the tokens have been successfully stored.
   * @throws {UnauthorizedException} If the token exchange or storage process fails.
   */
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

      const credentials: MicrosoftCredentialsStoreData = {
        userId,
        accessToken,
        refreshToken,
        idToken,
      };

      await this.saveMicrosoftCredentialsInDB(credentials);
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

  /**
   * Retrieves Microsoft OAuth tokens using an authorization code and saves the credentials for the user.
   * This method is intended for use with the Outlook plugin authentication flow.
   *
   * @param code - The authorization code received from Microsoft after user login.
   * @param redirect - The redirect URI used in the OAuth flow.
   * @returns An object containing the authenticated user's email address.
   * @throws {UnauthorizedException} If the user's email is not permitted or not found in the system.
   * @throws {Error} If any error occurs during the token exchange or user retrieval process.
   */
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

      const user = await this.getUserFromEmailOrUserId(
        account_data.userPrincipalName,
        null,
      );

      if (!user) {
        throw new UnauthorizedException(
          CUSTOM_MS_ERROR_CODES_FOR_PLUGIN.EmailNotPermitted,
        );
      }

      const credentials: MicrosoftCredentialsStoreData = {
        userId: user.id,
        accessToken,
        refreshToken,
        idToken,
      };

      await this.saveMicrosoftCredentialsInDB(credentials);

      return {
        email: account_data.userPrincipalName,
      };
    } catch (error: any) {
      this.logger.error(
        `Error obtaining Microsoft tokens for user for outlook plugin`,
        MsGraphService.name,
        (error as Error).stack || error,
      );
      throw error;
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

  /**
   * Saves an email as an HTML file to the user's OneDrive, including any attachments.
   *
   * This method performs the following steps:
   * 1. Retrieves the user based on the provided email or user principal.
   * 2. Uploads any provided attachments to a designated OneDrive folder.
   * 3. Generates an HTML representation of the email, including metadata and attachment links.
   * 4. Ensures the target folder for emails exists in OneDrive, creating it if necessary.
   * 5. Uploads the HTML file to OneDrive and returns the web URL of the uploaded file.
   *
   * @param email - The email data transfer object containing email metadata and content.
   * @param attachments - An array of files representing the email's attachments.
   * @returns A promise that resolves to the web URL of the uploaded email file in OneDrive.
   * @throws {BadRequestException} If the user cannot be found for the provided email address.
   * @throws {any} If any other error occurs during the process.
   */
  async saveEmailAsFileToOneDrive(
    email: EmailFromOutlookDto,
    attachments: Express.Multer.File[],
  ): Promise<string> {
    try {
      const userPrincipal = email.userPrincipal || '';
      const subject = email.subject;
      const from = email.from;
      const toRecipients: string[] = JSON.parse(email.toRecipients) as string[];
      const ccRecipients: string[] = JSON.parse(
        email.ccRecipients || '[]',
      ) as string[];
      const date = normalizeDate(new Date(email.date));
      const bodyHtml = email.bodyHtml;

      // Get The User
      const user = await this.getUserFromEmailOrUserId(userPrincipal, null);
      if (!user) {
        throw new BadRequestException(
          'Unable to find the user for the provided email address',
        );
      }

      const fileName = `${subject || 'email'}-${uuidv4()}.html`;

      const attachmentUrls: string[] = await this.uploadFilesToOneDrive(
        user.id,
        attachments,
        'Outlook_Plugin_Email_Attachments',
      );

      const emailContent = createOutlookEmailTemplate(
        subject,
        from,
        toRecipients,
        ccRecipients,
        date,
        bodyHtml,
        attachmentUrls,
      );

      const folderId = await this.createFolderInOneDriveIfNotExists(
        user.id,
        'Outlook_Plugin_Emails',
      );

      const uploadUrl = get_EMAIL_UPLOAD_URL(folderId, fileName);

      const uploadRes = (await this.continueMsGraphWithTokenRefresh(
        user.id,
        uploadUrl,
        'PUT',
        'text/html',
        emailContent,
      )) as AxiosResponse;

      // console.log('upload res: ', uploadRes);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      return uploadRes?.data?.webUrl;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Checks the authentication status of a user for the Outlook plugin by their email address.
   *
   * This method attempts to retrieve the user by email and refresh their Microsoft tokens.
   * If both operations succeed, the user is considered authenticated.
   * If any error occurs during the process, the user is considered not authenticated.
   *
   * @param email - The email address of the user to check authentication for.
   * @returns A promise that resolves to `true` if the user is authenticated, or `false` otherwise.
   */
  async checkAuthenticationStatus(
    email?: string,
    userId?: string,
  ): Promise<boolean> {
    try {
      let user: UserResponseDto | null = null;
      if (email) {
        user = await this.getUserFromEmailOrUserId(email, null);
      } else if (userId) {
        user = await this.getUserFromEmailOrUserId(null, userId);
      }
      if (!user) {
        return false; // User not found, not authenticated
      }
      await this.refreshMsTokens(user.id);
      return true; // If we reach here, the user is authenticated
    } catch (error) {
      console.log(
        'Something went wrong while checking authentication status: ',
        error,
      );
      return false; // If any error occurs, the user is not authenticated
    }
  }
}
