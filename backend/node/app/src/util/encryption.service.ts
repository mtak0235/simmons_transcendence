import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class EncryptionService {
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
