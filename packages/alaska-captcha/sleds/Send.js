// @flow

import random from 'string-random';
import alaska, { Sled } from 'alaska';
import service from '../';
import Captcha from '../models/Captcha';

const locales = service.getConfig('locales');
const CACHE = service.cache;

export default class Send extends Sled {
  /**
   * 发送验证码
   * @param params
   *        params.to
   *        params.id Captcha ID
   *        [params.ctx]
   *        [params.locale]
   *        [params.code] 验证码
   *        [params.values] 信息模板值
   */
  async exec(params: Object) {
    let id = params.id;
    let to = params.to;
    let locale = params.locale;
    let values = params.values || {};
    let code = params.code || values.code;
    if (!locale && params.ctx && locales && locales.length > 1) {
      locale = params.ctx.locale;
    }
    // $Flow findById
    let captcha: ?Captcha = await Captcha.findById(id);
    if (!captcha) {
      throw new Error('unknown captcha');
    }

    if (!code) {
      code = random(captcha.length, {
        numbers: captcha.numbers || false,
        letters: captcha.letters || false
      });
    }

    values.code = code;

    let cacheKey = 'captcha_' + to;
    CACHE.set(cacheKey, code, captcha.lifetime * 1000 || 1800 * 1000);

    if (captcha.type === 'sms' && captcha.sms && alaska.hasService('alaska-sms')) {
      await alaska.getService('alaska-sms').run('Send', {
        to,
        sms: captcha.sms,
        locale,
        values
      });
    } else if (captcha.type === 'email' && captcha.email && alaska.hasService('alaska-email')) {
      await alaska.getService('alaska-email').run('Send', {
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
