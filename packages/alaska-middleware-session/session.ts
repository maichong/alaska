import { Context } from 'alaska-http';

/**
 * @class Session
 * @property {boolean} isNew
 * @property {number} length
 */
export default class Session {
  _ctx: Context;
  isNew: boolean;

  /**
   * @constructor
   * @param {Context} ctx
   * @param {Object} [obj]
   */
  constructor(ctx: Context, obj?: Object) {
    this._ctx = ctx;
    if (!obj) {
      this.isNew = true;
    } else {
      for (let k of Object.keys(obj)) {
        // @ts-ignore Session对象可遍历
        this[k] = obj[k];
      }
    }
  }

  get length(): number {
    return Object.keys(this.toJSON()).length;
  }

  /**
   * 返回格式化后的对象
   * @returns {Object}
   */
  toJSON(): Object {
    let me = this;
    let obj = {};
    Object.keys(this).forEach((key) => {
      if (key === 'isNew' || key[0] === '_') return;
      // @ts-ignore Session对象可遍历
      obj[key] = me[key];
    });
    return obj;
  }

  /**
   * 判断是否发生变化
   * @param {string} prev 之前数据的json字符串
   * @returns {boolean}
   */
  isChanged(prev: string): boolean {
    if (!prev) {
      return true;
    }
    return JSON.stringify(this) !== prev;
  }
}
