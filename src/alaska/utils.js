// @flow

/* eslint no-useless-escape:0 */

import fs from 'fs';
import _ from 'lodash';

/**
 * 异步获取文件信息
 * @param {string} path
 * @returns {Promise<Stats>}
 */
export function statAsync(path: string): Promise<Object> {
  return new Promise((resolve, reject) => {
    fs.stat(path, (error, stats) => (error ? reject(error) : resolve(stats)));
  });
}

/**
 * 判断指定路径是否是文件
 * @param {string} path
 * @returns {boolean}
 */
export function isFile(path: string): boolean {
  try {
    return fs.statSync(path).isFile();
  } catch (e) {
    return false;
  }
}

/**
 * 判断指定路径是否是文件夹
 * @param {string} path
 * @returns {boolean}
 */
export function isDirectory(path: string): boolean {
  try {
    return fs.statSync(path).isDirectory();
  } catch (e) {
    return false;
  }
}

/**
 * 读取JSON文件
 * @param path
 */
export function readJson(path: string): Object {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

/**
 * 判断某路径是否是隐藏的
 * @param {string} path
 * @returns {boolean}
 */
export function isHidden(path: string): boolean {
  return /[\\\/]\.\w/.test(path);
}

const _resolved = Promise.resolve(null);

/**
 * resolved
 * @returns {Promise}
 */
export function resolved(): Promise<null> {
  return _resolved;
}

/**
 * noop
 */
export function noop() {
}

/**
 * 递归将obj上所有的方法绑定至scope
 * @param {Object} obj
 * @param {Object} scope
 * @returns {Object}
 */
export function bindMethods(obj: Object, scope: Object): Object {
  return Object.keys(obj).reduce((bound, key) => {
    if (typeof obj[key] === 'function') {
      bound[key] = obj[key].bind(scope);
    } else if (_.isObject(obj[key])) {
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
export function escapeRegExp(str: string): string {
  if (str && str.toString) str = str.toString();
  if (typeof str !== 'string' || !str.length) return '';
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

/**
 * 判断字符串是否是合法的ObjectID格式
 * @param {string} input
 * @returns {boolean}
 */
export function isObjectId(input: string): boolean {
  return /^[a-f0-9]{24}$/.test(input);
}

/**
 * 将驼峰样式字符串转为小写字符串样式
 * @param {string} name
 * @returns {string}
 */
export function nameToKey(name: string): string {
  return name.replace(/([a-z])([A-Z])/g, (a, b, c) => (b + '-' + c.toLowerCase())).toLowerCase();
}

/**
 * 深度克隆对象
 * @param {Object} target 目标对象
 * @param {Object} src 原始对象
 * @returns {Object}
 */
export function deepClone(target: Object, src: Object): Object {
  target = target || {};
  Object.keys(src).forEach((key) => {
    if (typeof target[key] !== 'object' || Array.isArray(target[key])) {
      target[key] = src[key];
    } else {
      target[key] = _.defaultsDeep({}, src[key], target[key]);
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
export function merge(target: Object, patch: Object): Object {
  if (!_.isPlainObject(patch)) {
    return patch;
  }
  if (!_.isPlainObject(target)) {
    target = {};
  }
  _.forEach(patch, (value, key) => {
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
export function parseAcceptLanguage(header: string): string[] {
  if (!header) {
    return [];
  }
  return header.split(',')
    .map((item) => {
      let lang = item.split(';q=');
      if (lang.length < 2) {
        return [item, 1];
      }
      return [lang[0], parseFloat(lang[1]) || 0];
    })
    .filter((lang) => lang[1] > 0)
    .sort((a, b) => (a[1] < b[1] ? 1 : -1))
    .map((lang) => lang[0]);
}
