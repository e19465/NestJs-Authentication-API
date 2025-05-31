import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { OIDCStrategy } from 'passport-azure-ad';
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
    });
  }

  async validate(profile, done): Promise<any> {
    return done(null, profile);
  }
}

('http://localhost:3000/auth/microsoft/redirect?code=1.AXEAt4HRuPxYzEKIU5xIgN362nr7c9GkeTJFqoawLzPI68QuAVxxAA.AgABBAIAAABVrSpeuWamRam2jAF1XRQEAwDs_wUA9P_K9zMptYKjUPSCfxhegQY6lihQFW9lUcRcKyNKdvBBnvCZWFSOWOqeNJDP5rAdzqXFcobwSUHXt5M7c3Me8oB3mpuryhwvy7kFIQAQdQlcIPIJiw0EOWaTuhsFysxMmQsyIsBmBHqG0nKFtfQTFaOFC3qeV9Pf1Yutnhatk2q9LbHAQAEBrYCYL8OHM8WOTCDN0Sm8Q_YQRUnxnnDRlkPbX7Vy7LCVtxfOWvN3kjvP3j06ZQF0WGnyH7ZbQ6aapW1f5qe1EXQ323VgoC-35qm_eHbHPdZQc5v0yS8qK6cG_JZvL_DfujtDsWKc-7GB2cFppISbsOcyetnKc1i1CcuRoIGozjN0P76pHPppx6wH36cVpPR3gpJ3JdzgxXQ6aY_Vii3nJJd0idKUW95PYI_2sQr47jlVzw0GWX9souYhIuoN9DgKIC1mk9WBmI4Tv3yB4Gb87WahMmKVbw0Gko1HBKqzDRaPm4NUeCgDLc78Yw1eOuZIsdp1M1exsVQPs7MnqX97DNEHS1Iie6_QHKho4x8r6UnxONgDbYfTD8EzCsV36UiqKKRUunmAJ8KLw5AUuWMM7XOcYv7S0IbFrYgTizd661A3um2etQr7sFyUdNq-e4UevZJOPdpKwLPX6Ifdej8K40_GK_hrPvZwS46GUm1thetyPQBd67biCrcyJ81S_DjDjXwXjHJXGJgJ9ECYnhR_XJkYxCKFxnTzLMdjyb77yQxCvsBwVfgMjqZP4S7OK8uOaLLu1qdN9VLHPI-pH86KNYUg4Gu9Gcs8STCq0eBuPtdkIwW3IJLbbhl98_DQB93jWiEUlAfYuwQD3rhcp3p3aFx-fztVXw8vby_4G_aCqLodfVk29M4B1zQ6dPIX_c2YzmnOm6cTHHd1shj5TTtqOIOiblupc3ON8J-UI0uKvxCfeKAsAdKqwKvTqAZ0H2zmy5rp3QZl-AuC8ELUPhPBjLs6y1LBNGJvQlshk6Sy6v54rybtCBgYVweWG1397Ctzrcv_5r_nIuoVxswZ0N_8NDZo0_hWsH0NW8hD2KJqN9jjkC1N1RwBRTzzDq09SQNTUw3YeAmfwUX6GmSyiJl6pa64eQ9FVqA50MApL5hiNVQSi8B0IqU4M_e7GNDPwqvEGw&state=hBpEt-iVYOFBQ1UIWjJ92uQRwC0wPUJL&session_state=26a2ddad-8514-4980-8f74-5b57e5e75902');
