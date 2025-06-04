/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import {
  OIDCStrategy,
  IOIDCStrategyOptionWithRequest,
  IOIDCStrategyVerifyCallback,
  IOIDCProfile,
} from 'passport-azure-ad';
import { MicrosoftSettings } from 'src/settings';

@Injectable()
export class AuthMicrosoftStrategy extends PassportStrategy(
  OIDCStrategy,
  'microsoft',
) {
  constructor() {
    super({
      identityMetadata: MicrosoftSettings.identityMetadata,
      clientID: MicrosoftSettings.clientID,
      clientSecret: MicrosoftSettings.clientSecret,
      responseType: MicrosoftSettings.responseType,
      responseMode: MicrosoftSettings.responseMode,
      redirectUrl: MicrosoftSettings.redirectUrl,
      allowHttpForRedirectUrl: MicrosoftSettings.allowHttpForRedirectUrl,
      scope: MicrosoftSettings.scope,
      passReqToCallback: false,
    } as IOIDCStrategyOptionWithRequest);
  }

  validate(profile: IOIDCProfile, done: IOIDCStrategyVerifyCallback): void {
    try {
      console.log('Microsoft profile:', profile);
      const user = {
        ...(profile?.oid && { id: profile.oid }),
        ...(profile?.upn || profile?.preferred_username
          ? { email: profile.upn || profile.preferred_username }
          : {}),
        ...(profile?.name || profile?.displayName
          ? { name: profile.name || profile.displayName }
          : {}),
      };
      // You can perform DB operations here if needed (e.g., find or create user)
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }

  // validate(profile: unknown, done: IOIDCStrategyVerifyCallback): void {
  //   done(null, profile);
  // }
}
