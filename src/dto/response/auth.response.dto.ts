export class DecodedJwtAccessToken {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export class JwtTokenResponseDto {
  access: string;
  refresh: string;
}
