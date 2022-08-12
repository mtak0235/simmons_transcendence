import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class EncryptionService {
  private readonly byte: Buffer;
  private readonly secretKey: Promise<Buffer>;

  constructor(private readonly configService: ConfigService) {
    this.byte = randomBytes(16);
    this.secretKey = promisify(scrypt)(
      String(this.configService.get('authConfig.crypto')),
      'salt',
      32,
    ).then();
  }

  async encrypt(text: string) {
    const cipher = createCipheriv(
      'aes-256-ctr',
      await this.secretKey,
      this.byte,
    );

    return Buffer.concat([cipher.update(text), cipher.final()]);
  }

  async decrypt(text: Buffer) {
    const decipher = createDecipheriv(
      'aes-256-ctr',
      await this.secretKey,
      this.byte,
    );

    return Buffer.concat([decipher.update(text), decipher.final()]);
  }

  /*
   *  Encryption to Bcrypt
   */

  async hash(code: string): Promise<string> {
    return await bcrypt.hash(code, 10);
  }

  async compare(code: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(code, hash);
  }
}
