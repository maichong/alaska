import { MiddlewareGenerator, MiddlewareConfig } from 'alaska-http';

export interface CaptchaMiddlewareConfig extends MiddlewareConfig {
  paths: {
    [path: string]: {
      id: string;
      to: string;
      captcha: string;
    };
  };
}

declare const captchaMiddleware: MiddlewareGenerator<CaptchaMiddlewareConfig>;

export default captchaMiddleware;
