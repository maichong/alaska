'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-02-28
 * @author Liang <liang@maichong.it>
 */

const path = require('path');
const _ = require('lodash');
const util = require('../util');

module.exports = function loadStatics() {
  this.loadStatics = util.noop;
  let service = this;
  let router = this.router();
  let statics = [];
  {
    let tmp = this.config('statics');
    if (tmp && typeof tmp === 'string') {
      statics.push({ root: tmp, prefix: '' });
    } else if (_.isArray(tmp)) {
      tmp.forEach(t => {
        if (t && typeof t === 'string') {
          statics.push({ root: t, prefix: '' });
        } else if (_.isObject(t) && t.root) {
          statics.push(t);
        }
      });
    } else if (_.isObject(tmp) && tmp.root) {
      statics.push(tmp);
    }
  }
  if (statics.length) {
    statics.forEach(c => {
      let root = path.resolve(service.dir, c.root);
      let prefix = (c.prefix || '') + '/*';
      let prefixLength = this.config('prefix').length + c.prefix.length;
      let index = c.index === false ? false : c.index || 'index.html';
      router.register(prefix, ['GET', 'HEAD'], function () {
        var ref = _asyncToGenerator(function* (ctx, next) {
          yield next();
          if (ctx.body != null || ctx.status != 404) return;
          let filePath = root;
          if (prefixLength) {
            filePath += ctx.path.substr(prefixLength);
          } else {
            filePath += ctx.path;
          }
          yield ctx.sendfile(filePath, {
            index,
            maxAge: c.maxAge
          });
        });

        return function (_x, _x2) {
          return ref.apply(this, arguments);
        };
      }());
    });
  }
};