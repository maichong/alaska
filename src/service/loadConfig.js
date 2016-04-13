/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-04-12
 * @author Liang <liang@maichong.it>
 */

import * as util from '../util';
import path from 'path';

export default async function loadConfig() {
  this.debug('loadConfig');
  this.loadConfig = util.resolved;

  for (let s of this._services) {
    await s.loadConfig();
  }

  //加载扩展配置
  for (let dir of this._configDirs) {
    let configFile = dir + '.js';
    if (util.isFile(configFile)) {
      this.applyConfig(require(configFile).default);
    }
    configFile = dir + '/config.js';
    if (util.isFile(configFile)) {
      this.applyConfig(require(configFile).default);
    }
  }

  //数据库collection前缀
  let dbPrefix = this.config('dbPrefix');
  if (dbPrefix === false) {
    this.dbPrefix = '';
  } else if (typeof dbPrefix === 'string') {
    this.dbPrefix = dbPrefix;
  } else {
    this.dbPrefix = this.id.replace('alaska-', '') + '_';
  }

  //templates 目录
  let templates = this.config('templates');
  if (templates) {
    if (templates[0] !== '/') {
      templates = path.join(this.dir, templates);
    }
    this._templatesDirs.unshift(templates);
  }
}
