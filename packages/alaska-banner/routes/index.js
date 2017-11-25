'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (router) {
  router.get('/redirect/:id', async (ctx, next) => {
    let id = ctx.params.id;
    if (!/^[0-9a-f]{24}$/.test(id)) {
      await next();
      return;
    }
    let banner = await _Banner2.default.findById(id);
    if (!banner || !banner.isValid() || banner.action !== 'url' || !banner.url) {
      await next();
      return;
    }
    banner.clicks += 1;
    banner.save();
    ctx.redirect(banner.url);
  });
};

var _Banner = require('../models/Banner');

var _Banner2 = _interopRequireDefault(_Banner);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }