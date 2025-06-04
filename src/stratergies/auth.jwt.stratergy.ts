import { UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { JwtSettings } from 'src/settings';
import { JwtPayload } from 'src/types/auth';

/**
 * JWT authentication strategy for NestJS using Passport.
 *
 * This strategy extracts the JWT access token from either the `access` cookie
 * or the `Authorization` header (as a Bearer token). If no token is found,
 * it throws an UnauthorizedException.
 *
 * The strategy uses the secret defined in `JwtSettings.accessTokenSecret` to
 * validate the token. Expired tokens are not ignored.
 *
 * @extends PassportStrategy(Strategy, 'jwt')
 */
export class AuthJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      /**
       * Extracts JWT from request cookies or Authorization header.
       * Throws UnauthorizedException if no token is found.
       */
      jwtFromRequest: (req: Request) => {
        let access_token: string | null = null;

        if (req && req.cookies) {
          access_token = req.cookies['access'];
        }

        if (!access_token) {
          const authHeader = req.headers.authorization;
          if (authHeader && authHeader.startsWith('Bearer ')) {
            access_token = authHeader.split(' ')[1];
          }
        }

        if (!access_token) {
          throw new UnauthorizedException('Unauthorized access');
        }
        return access_token;
      },
      ignoreExpiration: false,
      secretOrKey: JwtSettings.accessTokenSecret as string,
    });
  }

  /**
   * Validates the JWT payload.
   *
   * @param payload - The decoded JWT payload.
   * @returns The payload if validation is successful.
   */
  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
