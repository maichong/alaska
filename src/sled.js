/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-03-27
 * @author Liang <liang@maichong.it>
 */

'use strict';

const collie = require('collie');

class Sled {

  constructor(options) {
    this.options = options || {};
  }

  static pre(fn) {
    if (!this._pre) {
      this._pre = [];
    }
    this._pre.push(fn);
  }

  static post(fn) {
    if (!this._post) {
      this._post = [];
    }
    this._post.push(fn);
  }

  /**
   * [async] 执行sled
   * @returns {*}
   */
  async run() {
    if (this.constructor._pre) {
      await collie.compose(this.constructor._pre, [], this);
    }

    let result = this.exec();
    if (result && result.then) {
      result = await result;
    }

    if (this.constructor._post) {
      await collie.compose(this.constructor._post, [result], this);
    }

    this.run = function () {
      return Promise.resolve(result);
    };

    return result;
  }

  /**
   * @method exec
   */
}

module.exports = Sled;
