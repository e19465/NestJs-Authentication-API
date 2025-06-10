export type MicrosoftJwtTokenResponse = {
  token_type: string;
  scope: string;
  expires_in: number;
  ext_expires_in: number;
  access_token: string;
  refresh_token: string;
  id_token: string;
};

export type EmailFromOutlookDto = {
  subject: string;
  from: string;
  toRecipients: string;
  ccRecipients?: string;
  date: string;
  bodyHtml: string;
  userPrincipal?: string;
};
