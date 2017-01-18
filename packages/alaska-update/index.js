// @flow


import { Service } from 'alaska';

/**
 * @class UpdateService
 */
class UpdateService extends Service {
  constructor(options?: Alaska$Service$options, alaska?: Alaska$Alaska) {
    options = options || {};
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-update';
    super(options, alaska);
  }

  async postInit() {
    let MAIN = this.alaska.main;
    if (MAIN.config('autoUpdate')) {
      MAIN.pre('mount', async() => {
        //检查更新脚本
        let dir = MAIN.dir + '/updates/';
        try {
          await this.run('Update', { dir });
        } catch (error) {
          console.error(error.stack);
          process.exit(1);
        }
      });
    }
  }
}

export default new UpdateService();
