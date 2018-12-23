import * as random from 'string-random';
import { Sled } from 'alaska-sled';
import service, { CaptchaParams } from '..';
import Captcha from '../models/Captcha';
import { SmsService } from 'alaska-sms';

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
      code = random(captcha.length, {
        numbers: captcha.numbers || false,
        letters: captcha.letters || false
      });
    }

    values.code = code;

    let cacheKey = `captcha:${to}`;
    CACHE.set(cacheKey, code, captcha.lifetime * 1000 || 1800 * 1000);

    if (captcha.type === 'sms' && captcha.sms
      && service.main && service.main.allServices['alaska-sms']) {
      let SMS = service.main.allServices['alaska-sms'] as SmsService;
      try {
        await SMS.sleds.Send.run({
          to,
          sms: captcha.sms,
          locale,
          values
        });
      } catch (error) {
        throw new Error(error);
      }
    } else if (captcha.type === 'email' && captcha.email
      && service.main && service.main.allServices['alaska-email']) {
      // FIXME:
      let EMAIL = service.main.allServices['alaska-email'] as any;
      try {
        await EMAIL.run('Send', {
          to,
          email: captcha.email,
          locale,
          values
        });
      } catch (error) {
        throw new Error(error);
      }
    } else {
      throw new Error('unsupported captcha type');
    }
  }
}
