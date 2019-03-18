import { Service, Driver, DriverOptions } from 'alaska';
import { Context } from 'alaska-http';
import CacheDriver from 'alaska-cache';
import User from 'alaska-user/models/User';
import { SelectOption } from '@samoyed/types';
import Captcha from './models/Captcha';
import Send from './sleds/Send';
import Verify from './sleds/Verify';

export interface SendParams {
  // 验证码记录ID
  id: string;
  // 要发送到的地址，匿名发布必选
  to?: string;
  // 非匿名发布必选
  user?: User;
  // 模板语言
  locale?: string;
  // 其他附加值
  values?: { [key: string]: any };
}

export interface VerifyParams {
  id: string;
  to?: string;
  user?: User;
  code: string;
}

export class CaptchaService extends Service {
  models: {
    Captcha: typeof Captcha;
  };
  sleds: {
    Send: typeof Send;
    Verify: typeof Verify;
  };
  cache: CacheDriver<string, any, any>;
}

declare const captchaService: CaptchaService;

export default captchaService;
