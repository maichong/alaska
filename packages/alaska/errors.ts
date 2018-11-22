/**
 * 一般错误
 * @class {NormalError}
 */
export class NormalError extends Error {
  code: number | void;

  constructor(message: string, code?: number) {
    super(message);
    this.code = code;
  }
}

/**
 * 严重错误
 * @class {PanicError}
 */
export class PanicError extends Error {
  code: number | void;

  constructor(message: string, code?: number) {
    super(message);
    this.code = code;
  }
}
