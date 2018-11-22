import * as _ from 'lodash';

/**
 * 将驼峰样式字符串转为小写字符串样式
 * @param {string} name
 * @returns {string}
 */
export function nameToKey(name: string): string {
  return name.replace(/([a-z])([A-Z])/g, (a, b, c) => (`${b}-${c.toLowerCase()}`)).toLowerCase();
}

/**
 * 合并对象，RFC 7396
 * @param {Object} target
 * @param {Object} patch
 * @returns {Object}
 */
export function merge<T>(target: T, patch: any): T {
  if (!_.isPlainObject(patch)) {
    return patch;
  }
  if (!_.isPlainObject(target)) {
    // @ts-ignore
    target = {};
  }
  _.forEach(patch, (value, key) => {
    if (value === null) {
      if (target.hasOwnProperty(key)) {
        // @ts-ignore
        delete target[key];
      }
    } else {
      // @ts-ignore
      target[key] = merge(target[key], value);
    }
  });
  return target;
}
