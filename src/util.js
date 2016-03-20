/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-01-19
 * @author Liang <liang@maichong.it>
 */

const fs = require('fs');
const _ = require('lodash');

/**
 * 判断指定路径是否是文件
 * @param path
 * @returns {boolean}
 */
exports.isFile = function isFile(path) {
  try {
    return fs.statSync(path).isFile();
  } catch (e) {
    return false;
  }
};

/**
 * 判断指定路径是否是文件夹
 * @param path
 * @returns {boolean}
 */
exports.isDirectory = function isDirectory(path) {
  try {
    return fs.statSync(path).isDirectory();
  } catch (e) {
    return false;
  }
};

/**
 * 智能导入
 * @param path 文件或文件夹路径
 * @param importDefault
 * @returns {object}
 */
exports.include = function include(path, importDefault = true) {
  if (exports.isFile(path)) {
    return require(path).default;
  }
  if (exports.isDirectory(path)) {
    let result = {};
    fs.readdirSync(path).forEach(file => {
      if (file.endsWith('.js')) {
        let name = file.slice(0, -3);
        let obj = require(path + '/' + file);
        result[name] = importDefault && obj.default ? obj.default : obj;
      }
    });
    return result;
  }
  return null;
};

/**
 * 判断某路径是否是隐藏的
 * @param path
 * @returns {boolean}
 */
exports.isHidden = function isHidden(path) {
  return /[\\\/]\.\w/.test(path);
};

const resolved = Promise.resolve();
exports.noop = function noop() {
  return resolved;
};

/**
 * 递归将obj上所有的方法绑定至scope
 * @param obj
 * @param scope
 * @returns {object}
 */
exports.bindMethods = function bindMethods(obj, scope) {
  let bound = {};
  for (let key in obj) {
    if (typeof obj[key] === 'function') {
      bound[key] = obj[key].bind(scope);
    } else if (_.isObject(obj[key])) {
      bound[key] = bindMethods(obj[key], scope);
    }
  }
  return bound;
};

/**
 * 生成安全的正则
 * @param str
 * @returns {*}
 */
exports.escapeRegExp = function escapeRegExp(str) {
  if (str && str.toString) str = str.toString();
  if (typeof str !== 'string' || !str.length) return '';
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
};

/**
 * 判断字符串是否是合法的MongoID格式
 * @param input
 */
exports.isMongoId = function (input) {
  return /^[a-f0-9]{24}$/.test(input);
};
