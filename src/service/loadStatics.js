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
    let router = this.router;
    statics.forEach(c => {
      let root = path.resolve(service.dir, c.root);
      let prefix = (c.prefix || '') + '/*';
      let prefixLength = this.config('prefix').length + c.prefix.length;
      let index = c.index === false ? false : (c.index || 'index.html');
      router.register(prefix, ['GET', 'HEAD'], async function (ctx, next) {
        await next();
        if (ctx.body != null || ctx.status != 404) return;
        let filePath = root;
        if (prefixLength) {
          filePath += ctx.path.substr(prefixLength);
        } else {
          filePath += ctx.path;
        }
        await ctx.sendfile(filePath, {
          index,
          maxAge: c.maxAge
        });
      });
    });
  }
};
