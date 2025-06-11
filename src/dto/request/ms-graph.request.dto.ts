export type EmailFromOutlookDto = {
  subject: string;
  from: string;
  toRecipients: string;
  ccRecipients?: string;
  date: string;
  bodyHtml: string;
  userPrincipal?: string;
};
