import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * Guard that handles authentication using the 'local' strategy.
 *
 * This guard extends NestJS's built-in `AuthGuard` with the 'local' strategy,
 * which is typically used for username/password authentication.
 *
 * When applied to a route, this guard will validate the user's credentials
 * using the configured local strategy (e.g., via Passport.js).
 *
 * @example
 * ```typescript
 * @UseGuards(AuthLocalGuard)
 * @Post('login')
 * async login(@Request() req) {
 *   return req.user;
 * }
 * ```
 *
 * @remarks
 * - This guard should be used on routes where you want to authenticate users
 *   with a username and password.
 * - The actual authentication logic should be implemented in the corresponding
 *   local strategy.
 *
 * @see [NestJS Guards](https://docs.nestjs.com/guards)
 * @see [Passport Local Strategy](http://www.passportjs.org/packages/passport-local/)
 */
export class AuthLocalGuard extends AuthGuard('local') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }
}
