'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function readDir(dir) {
  let map = {};
  try {
    let files = _fs2.default.readdirSync(dir);
    for (let name of files) {
      if (name[0] === '.') {
        continue;
      }
      map[name] = dir + '/' + name;
      if (utils.isDirectory(map[name])) {
        map[name] = readDir(map[name]);
      }
    }
  } catch (err) {}
  return map;
}

/* eslint no-empty:0 */

function objectToMap(obj, path, map) {
  path = path ? path + '/' : '';
  map = map || {};
  for (let key of Object.keys(obj)) {
    let p = path + key;
    let value = obj[key];
    if (typeof value === 'object') {
      objectToMap(value, p, map);
    } else {
      map[p] = value;
    }
  }
  return map;
}

class Renderer {

  constructor(service, options) {
    this.service = service;
    this.options = options || {};
    this.instanceOfRenderer = true;

    if (process.env.NODE_ENV !== 'production') {
      this.options.cache = false;
    }
  }

  /**
   * 获取模板文件映射
   * @returns {*}
   */
  getFileMap() {
    if (this.options.cache && this._map) {
      return this._map;
    }

    let files = {};
    this.service.templatesDirs.forEach(dir => {
      files = _lodash2.default.defaultsDeep({}, readDir(dir), files);
    });

    this._map = objectToMap(files);
    return this._map;
  }

}
exports.default = Renderer;
Renderer.classOfRenderer = true;