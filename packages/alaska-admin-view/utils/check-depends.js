/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-08-12
 * @author Liang <liang@maichong.it>
 */

import _every from 'lodash/every';

/**
 * 检查依赖
 * @param {string|object} depends
 * @param {object} data
 * @returns {boolean}
 */
export default function checkDepends(depends, data) {
  if (!depends) return true;
  if (typeof depends === 'string') {
    if (depends[0] === '!') {
      //反向
      depends = depends.substr(1);
      return !data[depends];
    }
    return !!data[depends];
  }
  return _every(depends, (v, k) => {
    if (Array.isArray(v)) {
      if (k[0] === '!') {
        k = k.substr(1);
        return v.indexOf(data[k]) === -1;
      }
      return v.indexOf(data[k]) > -1;
    }
    if (k[0] === '!') {
      k = k.substr(1);
      return data[k] != v;
    }
    if (k[0] === '>') {
      k = k.substr(1);
      if (k[0] === '=') {
        k = k.substr(1);
        return data[k] >= v;
      }
      return data[k] > v;
    }
    if (k[0] === '<') {
      k = k.substr(1);
      if (k[0] === '=') {
        k = k.substr(1);
        return data[k] <= v;
      }
      return data[k] < v;
    }
    return data[k] == v;
  });
}
