import { Sled } from 'alaska-sled';
import service, { VerifyParams } from '..';

export default class Verify extends Sled<VerifyParams, boolean> {
  /**
   * 验证
   * @param params
   *        params.to
   *        params.code
   */
  async exec(params: VerifyParams) {
    if (!params.to || !params.code) return false;
    const CACHE = service.cache;
    let cacheKey = 'captcha_' + params.to;
    let cache = await CACHE.get(cacheKey);
    if (!cache || cache !== params.code) {
      return false;
    }
    CACHE.del(cacheKey);
    return true;
  }
}
