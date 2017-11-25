'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (options) {
  return function (ctx, next) {
    if (ctx.method !== 'POST' || ctx.files !== undefined) return next();
    if (!ctx.request.is('multipart/*')) return next();
    ctx.files = {};
    return (0, _asyncBusboy2.default)(ctx.req, options).then(res => {
      const files = res.files;
      const fields = res.fields;
      ctx.files = {};
      files.forEach(file => {
        let fieldname = file.fieldname;
        if (ctx.files[fieldname]) {
          if (Array.isArray(ctx.files[fieldname])) {
            ctx.files[fieldname].push(file);
          } else {
            ctx.files[fieldname] = [ctx.files[fieldname], file];
          }
        } else {
          ctx.files[fieldname] = file;
        }
      });
      ctx.request.body = fields;
      return next();
    });
  };
};

var _asyncBusboy = require('async-busboy');

var _asyncBusboy2 = _interopRequireDefault(_asyncBusboy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }