
import * as _ from 'lodash';
import { Service, ServiceOptions, Driver } from 'alaska';
import { Context } from 'alaska-http';
import { Sled } from 'alaska-sled';
import MongoCacheDriver from 'alaska-cache-mongo';

class CaptchaService extends Service {

  cache: Driver<any, any>;

  constructor(options?: ServiceOptions) {
    options = options || { configFileName: '', id: '' };
    options.id = options.id || 'alaska-captcha';
    options.configFileName = options.configFileName || __dirname;
    super(options);
  }

  preInit() {
    let cacheConfig = this.config.get('cache');
    if (!cacheConfig || !Object.keys(cacheConfig).length) {
      throw new Error(`Service '${this.id}' without cache driver!`);
    }
    this.cache = this.createDriver(cacheConfig);
  }

  /**
   * 运行一个Sled
   * @param {string} sledName
   * @param {Object} [data]
   * @returns {Promise<*>}
   */
  run(sledName: string, data?: Object): Promise<any> {
    if (!this.sleds || !this.sleds[sledName]) {
      throw new Error(`"${sledName}" sled not found`);
    }
    try {
      let SledClass: typeof Sled = this.sleds[sledName];
      let sled = new SledClass(data);
      return sled.run();
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

export default new CaptchaService();
