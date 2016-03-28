/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-03-27
 * @author Liang <liang@maichong.it>
 */

'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

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
  run() {
    var _this = this;

    return _asyncToGenerator(function* () {
      if (_this.constructor._pre) {
        yield collie.compose(_this.constructor._pre, [], _this);
      }

      let result = _this.exec();
      if (result && result.then) {
        result = yield result;
      }

      if (_this.constructor._post) {
        yield collie.compose(_this.constructor._post, [result], _this);
      }

      _this.run = function () {
        return Promise.resolve(result);
      };

      return result;
    })();
  }

  /**
   * @method exec
   */
}

module.exports = Sled;