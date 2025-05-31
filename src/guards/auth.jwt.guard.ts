import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * Guard that implements JWT authentication for incoming requests.
 *
 * This class extends NestJS's built-in `AuthGuard` with the 'jwt' strategy,
 * enabling JWT-based authentication for protected routes.
 *
 * @remarks
 * - Should be used as a route or controller guard to enforce JWT validation.
 * - Relies on the Passport JWT strategy configuration.
 *
 * @example
 * ```typescript
 * @UseGuards(AuthJwtGuard)
 * @Get('protected')
 * getProtectedResource() {
 *    This route is protected by JWT authentication
 * }
 * ```
 *
 * @see [NestJS Guards Documentation](https://docs.nestjs.com/guards)
 * @see [Passport JWT Strategy](http://www.passportjs.org/packages/passport-jwt/)
 */
@Injectable()
export class AuthJwtGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }
}
