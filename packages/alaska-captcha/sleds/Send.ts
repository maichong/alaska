import * as random from 'string-random';
import { Sled } from 'alaska-sled';
import service, { CaptchaParams } from '..';
import Captcha from '../models/Captcha';
import { SmsService } from 'alaska-sms';
import { EmailService } from 'alaska-email';

export default class Send extends Sled<CaptchaParams, void> {
  /**
   * 发送验证码
   * @param {Object}  params
   * @param {string} params.to
   * @param {string}  params.id Captcha ID
   * @param {Context}  [params.ctx]
   * @param {string}  [params.locale]
   * @param {string} [params.code] 验证码
   * @param {Object} [params.values] 信息模板值
   */
  async exec(params: CaptchaParams) {
    const locales = service.config.get('locales');
    const CACHE = service.cache;
    let id = params.id;
    let to = params.to;
    let locale = params.locale;
    let values = params.values || {};
    let code = params.code || values.code;
    if (!locale && params.ctx && locales && locales.length > 1) {
      locale = params.ctx.locale;
    }
    let captcha = await Captcha.findById(id);
    if (!captcha) {
      service.error('Unknown captcha');
    }

    if (!code) {
      code = random(captcha.length, captcha.characters);
    }

    values.code = code;

    let cacheKey = `captcha:${to}`;
    CACHE.set(cacheKey, code, captcha.lifetime * 1000 || 1800 * 1000);

    if (captcha.type === 'sms' && captcha.sms
      && service.main && service.main.allServices.get('alaska-sms')) {
      let SMS = service.main.allServices.get('alaska-sms') as SmsService;
      await SMS.sleds.Send.run({
        to,
        sms: captcha.sms,
        locale,
        values
      });
    } else if (captcha.type === 'email' && captcha.email
      && service.main && service.main.allServices.get('alaska-email')) {
      let EMAIL = service.main.allServices.get('alaska-email') as EmailService;
      await EMAIL.sleds.Send.run({
        to,
        email: captcha.email,
        locale,
        values
      });
    } else {
      throw new Error('unsupported captcha type');
    }
  }
}
