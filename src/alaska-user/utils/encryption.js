// @flow

import crypto from 'crypto';

export default class Encryption {
  key: Buffer;
  iv: Buffer;

  constructor(password: string) {
    this.key = crypto.createHash('sha256').update(password).digest();
    this.iv = this.key.slice(0, 16);
  }

  encrypt(buf: Buffer|string): Buffer {
    let cipher = crypto.createCipheriv('aes-256-cfb', this.key, this.iv);
    // $Flow
    return Buffer.concat([cipher.update(buf), cipher.final()]);
  }

  decrypt(buf: Buffer): Buffer {
    let cipher = crypto.createDecipheriv('aes-256-cfb', this.key, this.iv);
    return Buffer.concat([cipher.update(buf), cipher.final()]);
  }

  hash(input: string|Buffer): string {
    return crypto.createHash('sha256').update(input).digest('base64');
  }
}
