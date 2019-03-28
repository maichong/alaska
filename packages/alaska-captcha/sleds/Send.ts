import * as random from 'string-random';
import { Sled } from 'alaska-sled';
import service, { SendParams } from '..';
import Captcha from '../models/Captcha';
import { SmsService } from 'alaska-sms';
import { EmailService } from 'alaska-email';

export default class Send extends Sled<SendParams, void> {
  /**
   * 发送验证码
   * @param {Object}  params
   * @param {string} params.to
   * @param {string}  params.id Captcha ID
   * @param {string}  [params.locale]
   * @param {string} [params.code] 验证码
   * @param {Object} [params.values] 信息模板值
   */
  async exec(params: SendParams) {
    const CACHE = service.cache;
    let id = params.id;
    let to = params.to;
    let user = params.user;
    let locale = params.locale;
    let values = params.values || {};
    let captcha = await Captcha.findById(id).session(this.dbSession);
    if (!captcha) service.error('Unknown captcha');

    if (captcha.anonymous && !to) throw new Error('to is required for send captcha!');
    if (!captcha.anonymous && !user) throw new Error('user is required for send captcha!');

    if (!captcha.anonymous) {
      to = user.get(captcha.userField) || service.error('Can not get captcha destination field value for the user!');
    }

    let code = random(captcha.length, captcha.characters);

    values.code = code;

    let cacheKey = `captcha:${id}:${to}`;
    CACHE.set(cacheKey, code, captcha.lifetime * 1000 || 1800 * 1000);

    const smsService = service.lookup('alaska-sms') as SmsService;
    const emailService = service.lookup('alaska-email') as EmailService;

    if (captcha.type === 'sms' && captcha.sms && smsService) {
      await smsService.sleds.Send.run({
        to,
        sms: captcha.sms,
        locale,
        values
      }, { dbSession: this.dbSession });
    } else if (captcha.type === 'email' && captcha.email && emailService) {
      await emailService.sleds.Send.run({
        to,
        email: captcha.email,
        locale,
        values
      }, { dbSession: this.dbSession });
    } else {
      throw new Error('unsupported captcha type');
    }
  }
}
