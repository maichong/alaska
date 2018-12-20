import { Service, Driver, DriverOptions } from 'alaska';
import { Context } from 'alaska-http';
import CacheDriver from 'alaska-cache';
import { SelectOption } from '@samoyed/types';
import Captcha from './models/Captcha';
import Send from './sleds/Send';
import Verify from './sleds/Verify';

export interface CaptchaParams {
  to: string;
  id: string;
  ctx?: Context;
  locale?: string;
  code?: string;
  values?: { [key: string]: any };
}

export interface VerifyParams {
  to: string;
  code: string;
}

declare class CaptchaService extends Service {
  models: {
    Captcha: typeof Captcha;
  };
  sleds: {
    Send: typeof Send;
    Verify: typeof Verify;
  };
  cache: CacheDriver<string, any, any>;
}

declare const CAPTCHA: CaptchaService;

export default CAPTCHA;
