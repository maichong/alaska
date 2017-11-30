'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.statAsync = statAsync;
exports.isFile = isFile;
exports.isDirectory = isDirectory;
exports.readJson = readJson;
exports.isHidden = isHidden;
exports.resolved = resolved;
exports.noop = noop;
exports.bindMethods = bindMethods;
exports.escapeRegExp = escapeRegExp;
exports.isObjectId = isObjectId;
exports.nameToKey = nameToKey;
exports.deepClone = deepClone;
exports.merge = merge;
exports.parseAcceptLanguage = parseAcceptLanguage;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 异步获取文件信息
 * @param {string} path
 * @returns {Promise<Stats>}
 */


/* eslint no-useless-escape:0 */

function statAsync(path) {
  return new Promise((resolve, reject) => {
    _fs2.default.stat(path, (error, stats) => error ? reject(error) : resolve(stats));
  });
}

/**
 * 判断指定路径是否是文件
 * @param {string} path
 * @returns {boolean}
 */
function isFile(path) {
  try {
    return _fs2.default.statSync(path).isFile();
  } catch (e) {
    return false;
  }
}

/**
 * 判断指定路径是否是文件夹
 * @param {string} path
 * @returns {boolean}
 */
function isDirectory(path) {
  try {
    return _fs2.default.statSync(path).isDirectory();
  } catch (e) {
    return false;
  }
}

/**
 * 读取JSON文件
 * @param path
 */
function readJson(path) {
  return JSON.parse(_fs2.default.readFileSync(path, 'utf8'));
}

/**
 * 判断某路径是否是隐藏的
 * @param {string} path
 * @returns {boolean}
 */
function isHidden(path) {
  return (/[\\\/]\.\w/.test(path)
  );
}

const _resolved = Promise.resolve(null);

/**
 * resolved
 * @returns {Promise}
 */
function resolved() {
  return _resolved;
}

/**
 * noop
 */
function noop() {}

/**
 * 递归将obj上所有的方法绑定至scope
 * @param {Object} obj
 * @param {Object} scope
 * @returns {Object}
 */
function bindMethods(obj, scope) {
  return Object.keys(obj).reduce((bound, key) => {
    if (typeof obj[key] === 'function') {
      bound[key] = obj[key].bind(scope);
    } else if (_lodash2.default.isObject(obj[key])) {
      bound[key] = bindMethods(obj[key], scope);
    }
    return bound;
  }, {});
}

/**
 * 生成安全的正则字符串
 * @param {string} str
 * @returns {string}
 */
function escapeRegExp(str) {
  if (str && str.toString) str = str.toString();
  if (typeof str !== 'string' || !str.length) return '';
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

/**
 * 判断字符串是否是合法的ObjectID格式
 * @param {string} input
 * @returns {boolean}
 */
function isObjectId(input) {
  return (/^[a-f0-9]{24}$/.test(input)
  );
}

/**
 * 将驼峰样式字符串转为小写字符串样式
 * @param {string} name
 * @returns {string}
 */
function nameToKey(name) {
  return name.replace(/([a-z])([A-Z])/g, (a, b, c) => b + '-' + c.toLowerCase()).toLowerCase();
}

/**
 * 深度克隆对象
 * @param {Object} target 目标对象
 * @param {Object} src 原始对象
 * @returns {Object}
 */
function deepClone(target, src) {
  target = target || {};
  Object.keys(src).forEach(key => {
    if (typeof target[key] !== 'object' || Array.isArray(target[key])) {
      target[key] = src[key];
    } else {
      target[key] = _lodash2.default.defaultsDeep({}, src[key], target[key]);
    }
  });
  return target;
}

/**
 * 合并对象，RFC 7396
 * @param {Object} target
 * @param {Object} patch
 * @returns {Object}
 */
function merge(target, patch) {
  if (!_lodash2.default.isPlainObject(patch)) {
    return patch;
  }
  if (!_lodash2.default.isPlainObject(target)) {
    target = {};
  }
  _lodash2.default.forEach(patch, (value, key) => {
    if (value === null) {
      if (target.hasOwnProperty(key)) {
        delete target[key];
      }
    } else {
      target[key] = merge(target[key], value);
    }
  });
  return target;
}

/**
 * 解析Accept Language
 * @param {string} header
 * @returns {Array}
 */
function parseAcceptLanguage(header) {
  if (!header) {
    return [];
  }
  return header.split(',').map(item => {
    let lang = item.split(';q=');
    if (lang.length < 2) {
      return [item, 1];
    }
    return [lang[0], parseFloat(lang[1]) || 0];
  }).filter(lang => lang[1] > 0).sort((a, b) => a[1] < b[1] ? 1 : -1).map(lang => lang[0]);
}