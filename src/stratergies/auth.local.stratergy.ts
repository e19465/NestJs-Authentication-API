import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from 'src/modules/auth/auth.service';

/**
 * AuthLocalStrategy is a Passport strategy for authenticating users using a local strategy (email and password).
 *
 * - Uses the 'passport-local' strategy under the name 'local'.
 * - Expects 'email' and 'password' fields in the request body.
 * - Delegates user validation to the AuthService.
 * - Throws UnauthorizedException if credentials are invalid.
 *
 * @class
 * @extends PassportStrategy(Strategy, 'local')
 */
@Injectable()
export class AuthLocalStrategy extends PassportStrategy(Strategy, 'local') {
  /**
   * Injects AuthService and configures the strategy to use 'email' and 'password' fields.
   * @param authService - The authentication service for validating users.
   */
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  /**
   * Validates the user credentials.
   * @param email - The user's email address.
   * @param password - The user's password.
   * @returns The validated user object if credentials are correct.
   * @throws UnauthorizedException if credentials are invalid.
   */
  async validate(email: string, password: string): Promise<any> {
    try {
      const user = await this.authService.validateUser(email, password);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }
}
