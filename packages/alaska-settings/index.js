// @flow

import { Service } from 'alaska';

const debug = require('debug')('alaska-settings');

//为 alaska-admin-view 注入设置编辑器
export const routes = [{
  component: `${__dirname}/views/SettingsEditor`,
  path: 'settings'
}];

/**
 * @class SettingsService
 */
class SettingsService extends Service {

  constructor(options?: Alaska$Service$options) {
    options = options || {};
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-settings';
    super(options);
  }

  /**
   * 注册新设置选项
   * @param data
   * @returns {Settings}
   */
  async register(data: Object) {
    const Settings = this.model('Settings');

    const id = data.id || data._id;
    // $Flow
    let settings:Settings = await Settings.findById(id);
    if (settings) {
      return settings;
    }
    settings = new Settings(data);
    settings._id = id;
    debug('register', id);
    await settings.save();
    return settings;
  }

  /**
   * 获取设置
   * @param id
   * @returns {*}
   */
  async get(id: string|number) {
    const Settings = this.model('Settings');
    // $Flow
    let record = await Settings.findById(id);
    let value = record ? record.value : undefined;
    debug('get', id, '=>', value);
    return value;
  }

  /**
   * 保存设置,所要保存的设置项必须已经注册,如未注册则保存失败并返回null
   * @param {string} id
   * @param {*} value
   * @returns {Settings}
   */
  async set(id:string|number, value:any) {
    debug('set', id, '=>', value);
    const Settings = this.model('Settings');
    // $Flow
    let record = await Settings.findById(id);
    if (!record) {
      return null;
    }
    record.value = value;
    await record.save();
    return record;
  }
}

export default new SettingsService();
