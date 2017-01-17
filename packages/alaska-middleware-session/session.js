/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-02-28
 * @author Liang <liang@maichong.it>
 */

/**
 * @class Session
 * @property {boolean} isNew
 * @property {number} length
 */

'use strict';

module.exports = class Session {
  /**
   * @constructor
   * @param ctx
   * @param obj
   */
  constructor(ctx, obj) {
    this._ctx = ctx;
    if (!obj) {
      this.isNew = true;
    } else {
      for (let k in obj) {
        this[k] = obj[k];
      }
    }
  }

  get length() {
    return Object.keys(this.toJSON()).length;
  }

  /**
   * 返回格式化后的对象
   * @returns {Object}
   */
  toJSON() {
    let me = this;
    let obj = {};
    Object.keys(this).forEach(key => {
      if (key === 'isNew' || key[0] === '_') return;
      obj[key] = me[key];
    });
    return obj;
  }

  /**
   * 判断是否发生变化
   * @param {string} prev 之前数据的json字符串
   * @returns {boolean}
   */
  isChanged(prev) {
    if (!prev) {
      return true;
    }
    this._json = JSON.stringify(this);
    return this._json !== prev;
  }
};
