/**
 * Represents the decoded payload of a JWT access token.
 *
 * @property id - The unique identifier of the user.
 * @property email - The email address associated with the user.
 * @property role - The role assigned to the user.
 * @property iat - The issued-at timestamp (in seconds since epoch).
 * @property exp - The expiration timestamp (in seconds since epoch).
 */
export class DecodedJwtAccessToken {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Data Transfer Object representing the response containing JWT tokens.
 *
 * @property access - The access token used for authenticating API requests.
 * @property refresh - The refresh token used to obtain new access tokens.
 */
export class JwtTokenResponseDto {
  access: string;
  refresh: string;
}
