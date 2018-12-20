import { Service } from 'alaska';
import Settings from './models/Settings';
import { RegisterSettings } from '.';

export class SettingsService extends Service {
  /**
   * 注册新设置选项
   * @param data
   * @returns {Settings}
   */
  async register(data: RegisterSettings): Promise<Settings> {
    let settings: Settings = await Settings.findById(data.id);
    if (settings) {
      return settings;
    }
    settings = new Settings(data);
    console.log('Register settings', settings);
    settings._id = data.id;
    this.debug('register', data.id);
    await settings.save();
    return settings;
  }

  /**
   * 获取设置
   * @param id
   * @returns {*}
   */
  async get(id: string): Promise<any> {
    let record = await Settings.findById(id);
    // eslint-disable-next-line
    let value = record ? record.value : undefined;
    this.debug('get', id, '=>', value);
    return value;
  }

  /**
   * 保存设置,所要保存的设置项必须已经注册,如未注册则保存失败并返回null
   * @param {string} id
   * @param {*} value
   * @returns {Settings}
   */
  async set(id: string, value: any): Promise<Settings> {
    this.debug('set', id, '=>', value);
    let record = await Settings.findById(id);
    if (!record) {
      return null;
    }
    record.value = value;
    await record.save();
    return record;
  }
}

export default new SettingsService({
  id: 'alaska-settings'
});
