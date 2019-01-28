/**
 * 一般错误
 * @class {NormalError}
 */
export class NormalError extends Error {
  code: number | void;
  status: number | void;

  constructor(message: string, code?: number) {
    super(message);
    this.code = code;
    if (code > 100 && code < 600) {
      this.status = code;
    }
  }
}
