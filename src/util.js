/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-01-19
 * @author Liang <liang@maichong.it>
 */

import { statSync, readdirSync } from 'fs';

/**
 * 判断指定路径是否是文件
 * @param path
 * @returns {boolean}
 */
export function isFile(path) {
  try {
    return statSync(path).isFile();
  } catch (e) {
    return false;
  }
}

/**
 * 判断指定路径是否是文件夹
 * @param path
 * @returns {boolean}
 */
export function isDirectory(path) {
  try {
    return statSync(path).isDirectory();
  } catch (e) {
    return false;
  }
}

/**
 * 智能导入
 * @param path 文件或文件夹路径
 * @returns {Object}
 */
export function include(path) {
  if (isFile(path)) {
    return require(path).default;
  }
  if (isDirectory(path)) {
    let result = {};
    readdirSync(path).forEach(file => {
      if (file.endsWith('.js')) {
        let name = file.slice(0, -3);
        let obj = require(path + '/' + file);
        result[name] = obj.default;
      }
    });
    return result;
  }
  return null;
}

const resolved = Promise.resolve();
export function noop() {
  return resolved;
}
