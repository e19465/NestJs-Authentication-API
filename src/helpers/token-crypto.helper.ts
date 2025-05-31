import * as crypto from 'crypto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MicrosoftTokenEncryptionSettings } from 'src/settings';

@Injectable()
export class TokenCryptoHelper {
  private readonly key: Buffer;
  private readonly algorithm = 'aes-256-gcm';
  private readonly ivLength = 12;

  constructor() {
    const secret =
      MicrosoftTokenEncryptionSettings.microsoftTokenEncryptionSecret;
    if (!secret)
      throw new InternalServerErrorException(
        'MICROSOFT_TOKEN_ENCRYPTION_SECRET is not set in env',
      );
    this.key = crypto.createHash('sha256').update(secret).digest(); // 32 bytes for AES-256
  }

  encrypt(token: string): string {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    const encrypted = Buffer.concat([
      cipher.update(token, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    // Combine IV + AuthTag + Encrypted, then base64 encode
    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
  }

  decrypt(encryptedToken: string): string {
    const data = Buffer.from(encryptedToken, 'base64');

    const iv = data.slice(0, this.ivLength);
    const authTag = data.slice(this.ivLength, this.ivLength + 16); // 16-byte tag
    const encrypted = data.slice(this.ivLength + 16);

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }
}
