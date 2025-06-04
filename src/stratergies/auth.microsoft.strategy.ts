import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import {
  OIDCStrategy,
  IOIDCStrategyOptionWithRequest,
  IOIDCStrategyVerifyCallback,
} from 'passport-azure-ad';
import { MicrosoftSettings } from 'src/settings';

@Injectable()
export class AuthMicrosoftStrategy extends PassportStrategy(
  OIDCStrategy,
  'microsoft',
) {
  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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

  validate(profile: unknown, done: IOIDCStrategyVerifyCallback): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    done(null, profile);
  }
}
