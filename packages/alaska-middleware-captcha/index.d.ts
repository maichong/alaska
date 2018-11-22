import { MiddlewareGenerator, MiddlewareOptions } from 'alaska-http';

export interface CaptchaMiddlewareOptions extends MiddlewareOptions {
  paths: {
    [path: string]: {
      to: string;
      captcha: string;
    };
  };
}

declare const captchaMiddleware: MiddlewareGenerator<CaptchaMiddlewareOptions>;

export default captchaMiddleware;
