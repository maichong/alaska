import { Sled } from 'alaska-sled';
import Captcha from '../models/Captcha';
import service, { VerifyParams } from '..';

export default class Verify extends Sled<VerifyParams, boolean> {
  async exec(params: VerifyParams) {
    if (!params.code) return false;
    if (!params.to && !params.user) return false;

    let to = params.to;
    if (!to) {
      if (!params.user) return false;
      let captcha = await Captcha.findById(params.id);
      if (!captcha || captcha.anonymous) return false;
      to = params.user.get(captcha.userField);
      if (!to) return false;
    }

    const CACHE = service.cache;
    let cacheKey = `captcha:${params.id}:${to}`;
    let cache = await CACHE.get(cacheKey);
    if (!cache || cache !== params.code) {
      return false;
    }
    CACHE.del(cacheKey);
    return true;
  }
}
