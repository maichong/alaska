'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _Settings = require('./models/Settings');

var _Settings2 = _interopRequireDefault(_Settings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = (0, _debug2.default)('alaska-settings');

/**
 * @class SettingsService
 */


class SettingsService extends _alaska.Service {
  constructor(options) {
    options = options || { dir: '', id: '' };
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-settings';
    super(options);
  }

  /**
   * 注册新设置选项
   * @param data
   * @returns {Settings}
   */
  async register(data) {
    const id = data.id || data._id;
    // $Flow
    let settings = await _Settings2.default.findById(id);
    if (settings) {
      return settings;
    }
    settings = new _Settings2.default(data);
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
  async get(id) {
    // $Flow
    let record = await _Settings2.default.findById(id);
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
  async set(id, value) {
    debug('set', id, '=>', value);
    // $Flow
    let record = await _Settings2.default.findById(id);
    if (!record) {
      return null;
    }
    record.value = value;
    await record.save();
    return record;
  }
}

exports.default = new SettingsService();