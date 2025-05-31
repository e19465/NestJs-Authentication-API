import {
  CORS_ALLOWED_ORIGINS,
  CORS_ALLOWED_HEADERS,
  CORS_ALLOWED_METHODS,
  CORS_ALLOW_CREDENTIALS,
} from 'src/settings';

/**
 * Configuration options for CORS (Cross-Origin Resource Sharing) middleware.
 *
 * @property origin - A function that determines whether a specific origin is allowed to access the resources.
 *   If the origin is included in the `CORS_ALLOWED_ORIGINS` array or if the request has no origin (e.g., same-origin requests),
 *   the callback is invoked with `true` to allow the request. Otherwise, it returns an error to block the request.
 * @property credentials - Indicates whether the response to the request can be exposed when the credentials flag is true.
 *   This is set by the `CORS_ALLOW_CREDENTIALS` constant.
 * @property optionsSuccessStatus - The status code sent for successful OPTIONS requests (preflight requests).
 *   Set to 200 to accommodate legacy browsers.
 * @property allowedHeaders - Specifies the headers that are allowed in CORS requests, as defined by `CORS_ALLOWED_HEADERS`.
 * @property methods - Specifies the HTTP methods that are allowed for CORS requests, as defined by `CORS_ALLOWED_METHODS`.
 */
const corsOptions = {
  origin: (origin, callback) => {
    if (CORS_ALLOWED_ORIGINS.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: CORS_ALLOW_CREDENTIALS,
  optionsSuccessStatus: 200,
  allowedHeaders: CORS_ALLOWED_HEADERS,
  methods: CORS_ALLOWED_METHODS,
};

export default corsOptions;
