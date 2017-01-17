// @flow

import { Sled } from 'alaska';
import service from '../';
const CACHE = service.cache;

export default class Verify extends Sled {
  /**
   * 验证
   * @param params
   *        params.to
   *        params.code
   */
  async exec(params:Object) {
    if (!params.to || !params.code) return false;
    let cacheKey = 'captcha_' + params.to;
    let cache = await CACHE.get(cacheKey);
    if (!cache || cache !== params.code) {
      return false;
    }
    CACHE.del(cacheKey);
    return true;
  }
}
