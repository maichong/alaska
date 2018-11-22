import { Service, Driver, DriverOptions } from 'alaska';
import { Context } from 'alaska-http';
import MongoCacheDriver from 'alaska-cache-mongo';
import { SelectOption } from '@samoyed/types';
import Captcha from './models/Captcha';

// Sleds

export interface CaptchaParams {
  to: string;
  id: string;
  ctx: Context;
  locale: string;
  code: string;
  values: { [key: string]: any };
}

export interface VerifyParams {
  to: string;
  id: string;
  ctx: Context;
  locale: string;
  code: string;
  values: { [key: string]: any };
}

declare class CaptchaService extends Service {
  models: {
    Captcha: typeof Captcha;
  };
  cache: MongoCacheDriver<string>;

  /**
   * 运行一个Sled
   * @param {string} sledName
   * @param {Object} [data]
   * @returns {Promise<*>}
   */
  run(sledName: string, data?: Object): Promise<any>;
}

declare const CAPTCHA: CaptchaService;

export default CAPTCHA;
