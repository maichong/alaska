export default class Encryption {
  constructor(password: string);
  encrypt(buf: Buffer | string): Buffer;
  decrypt(buf: Buffer): Buffer;
  hash(input: string | Buffer): string;
}
