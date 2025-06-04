// ** PUT these in .env file in local development, add to environment in production ** //

// App settings
export const API_VERSION = 'v1';
export const API_URL_PATH_START = 'api';
export const PORT = '5000';
export const NODE_ENV = 'development';

// CORS settings
export const CORS_ALLOWED_ORIGINS =
  'http://localhost:3000, http://localhost:5000';
export const CORS_ALLOWED_METHODS =
  'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD';
export const CORS_ALLOWED_HEADERS =
  'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-HTTP-Method-Override, User-Agent, X-Forwarded-For, X-Forwarded-Proto, X-Forwarded-Host, X-Forwarded-Port, X-Forwarded-Ssl, X-Forwarded-Scheme, X-Forwarded-Prefix, X-Forwarded-Path, X-Forwarded-Method';
export const CORS_ALLOW_CREDENTIALS = 'true';

// DATABASE settings
export const DATABASE_URL = 'database url here';

// JWT settings
export const ACCESS_TOKEN_SECRET = 'your_access_token_secret';
export const REFRESH_TOKEN_SECRET = 'your_refresh_token_secret';

// MICROSOFT settings
export const MICROSOFT_CLIENT_ID = 'your_microsoft_client_id';
export const MICROSOFT_OBJECT_ID = 'your_microsoft_object_id';
export const MICROSOFT_TENANT_ID = 'your_microsoft_tenant_id';
export const MICROSOFT_CLIENT_SECRET = 'your_microsoft_client_secret';
export const MICROSOFT_CLIENT_SECRET_ID = 'your_microsoft_client_secret_id';
export const MICROSOFT_TOKEN_ENCRYPTION_SECRET =
  'your_microsoft_tokens_encryption_secret';
