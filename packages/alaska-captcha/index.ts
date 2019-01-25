
import * as _ from 'lodash';
import { Service } from 'alaska';
import CacheDriver from 'alaska-cache';

class CaptchaService extends Service {
  cache: CacheDriver<string, any, any>;

  preInit() {
    let cacheConfig = this.config.get('cache');
    if (!cacheConfig || !Object.keys(cacheConfig).length) {
      throw new Error(`Service '${this.id}' without cache driver!`);
    }
    this.cache = this.createDriver(cacheConfig) as CacheDriver<string, any, any>;
  }
}

export default new CaptchaService({ id: 'alaska-captcha' });
