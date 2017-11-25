'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

/**
 * @class UpdateService
 */
class UpdateService extends _alaska.Service {
  constructor(options) {
    options = options || { dir: '', id: '' };
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-update';
    super(options);
  }

  async postInit() {
    let MAIN = this.alaska.main;
    if (MAIN.getConfig('autoUpdate')) {
      MAIN.pre('mount', async () => {
        //检查更新脚本
        await this.run('Update');
      });
    }
  }
}

exports.default = new UpdateService();