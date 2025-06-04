import { getArrayFromCommaSeparatedString } from './helpers/shared.helper';

// App settings
const API_VERSION = process.env.API_VERSION || 'v1';
const API_URL_PATH_START = process.env.API_URL_PATH_START || 'api';
export const PORT = parseInt(process.env.PORT || '5000', 10);
export const API_PREFIX = `${API_URL_PATH_START}/${API_VERSION}`;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';

// CORS settings
export const CORS_ALLOWED_ORIGINS = getArrayFromCommaSeparatedString(
  process.env.CORS_ALLOWED_ORIGINS,
);
export const CORS_ALLOWED_METHODS = getArrayFromCommaSeparatedString(
  process.env.CORS_ALLOWED_METHODS,
);
export const CORS_ALLOWED_HEADERS = getArrayFromCommaSeparatedString(
  process.env.CORS_ALLOWED_HEADERS,
);
export const CORS_ALLOW_CREDENTIALS =
  process.env.CORS_ALLOW_CREDENTIALS === 'true' || false;

// DATABASE settings
export const DATABASE_URL = process.env.DATABASE_URL;

// JWT settings
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const JwtSettings = {
  accessTokenSecret: ACCESS_TOKEN_SECRET,
  refreshTokenSecret: REFRESH_TOKEN_SECRET,
  accessTokenExpiresIn: '15m',
  refreshTokenExpiresIn: '7d',
  accessCookieExpiresIn: 1 * 15 * 60 * 1000, // 15m in milliseconds
  refreshCookieExpiresIn: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

// Microsoft OAuth settings
const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
const MICROSOFT_OBJECT_ID = process.env.MICROSOFT_OBJECT_ID;
const MICROSOFT_TENANT_ID = process.env.MICROSOFT_TENANT_ID;
const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;
const MICROSOFT_CLIENT_SECRET_ID = process.env.MICROSOFT_CLIENT_SECRET_ID;

export const MicrosoftSettings = {
  clientID: MICROSOFT_CLIENT_ID,
  objectID: MICROSOFT_OBJECT_ID,
  tenantID: MICROSOFT_TENANT_ID,
  clientSecret: MICROSOFT_CLIENT_SECRET,
  clientSecretId: MICROSOFT_CLIENT_SECRET_ID,
  identityMetadata: `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/v2.0/.well-known/openid-configuration`,
  loginUrl: `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize`,
  responseType: 'code',
  responseMode: 'query',
  redirectUrl: `http://localhost:3000/auth/microsoft/redirect`,
  allowHttpForRedirectUrl: true,
  scope: [
    'openid',
    'profile',
    'email',
    'offline_access',
    'User.Read',
    'Files.ReadWrite',
    'Mail.ReadWrite',
    'Mail.Send',
  ],
};

const MICROSOFT_TOKEN_ENCRYPTION_SECRET =
  process.env.MICROSOFT_TOKEN_ENCRYPTION_SECRET;
export const MicrosoftTokenEncryptionSettings = {
  microsoftTokenEncryptionSecret: MICROSOFT_TOKEN_ENCRYPTION_SECRET,
};
