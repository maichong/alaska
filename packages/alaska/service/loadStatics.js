'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _utils = require('../utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = async function loadStatics() {
  this.loadStatics = utils.resolved;

  for (let sub of this.serviceList) {
    await sub.loadStatics();
  }

  this.debug('loadStatics');

  this.getConfig('statics', []).forEach(c => {
    let root = _path2.default.resolve(this.dir, c.root);
    let prefix = c.prefix || '';
    if (prefix === '/') {
      prefix = '';
    }
    let prefixLength = this.getConfig('prefix').length + prefix.length;
    let index = c.index === false ? false : c.index || 'index.html';
    this.router.register(prefix + '/*', ['GET', 'HEAD'], async (ctx, next) => {
      await next();
      if (ctx.body != null || ctx.status !== 404) return;
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
};