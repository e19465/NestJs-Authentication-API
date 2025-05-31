import { UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

export class AuthJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: (req) => {
        let access_token = null;

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
      secretOrKey: 'test-secret',
    });
  }

  validate(payload: any) {
    return payload;
  }
}
