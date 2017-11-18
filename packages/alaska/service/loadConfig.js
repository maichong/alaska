// @flow

import path from 'path';
import * as utils from '../utils';

export default async function loadConfig() {
  this.loadConfig = utils.resolved;

  for (let sub of this.serviceList) {
    await sub.loadConfig();
  }

  this.debug('loadConfig');

  //加载扩展配置
  for (let dir of this._configDirs) {
    let configFile = dir + '.js';
    if (utils.isFile(configFile)) {
      // $Flow
      this.applyConfig(require(configFile).default);
    }
    configFile = dir + '/config.js';
    if (utils.isFile(configFile)) {
      // $Flow
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
    this.templatesDirs.unshift(templates);
  }
}
