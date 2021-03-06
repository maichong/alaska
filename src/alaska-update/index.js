// @flow

import { Service } from 'alaska';

/**
 * @class UpdateService
 */
class UpdateService extends Service {
  constructor(options?: Alaska$Service$options) {
    options = options || { dir: '', id: '' };
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-update';
    super(options);
  }

  async postInit() {
    let MAIN = this.alaska.main;
    if (MAIN.getConfig('autoUpdate')) {
      MAIN.pre('mount', async() => {
        //检查更新脚本
        await this.run('Update');
      });
    }
  }
}

export default new UpdateService();
