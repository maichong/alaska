'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ = require('../');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = async function create(ctx) {
  if (!ctx.user) _2.default.error(403);
  let body = ctx.state.body || ctx.request.body;
  let goodsId = body.goods || ctx.request.body.goods;
  let skuId = body.sku || ctx.request.body.sku;
  let quantity = body.quantity || ctx.request.body.quantity;
  if (!goodsId) _2.default.error(400);
  ctx.body = await _2.default.run('Create', {
    user: ctx.user, goodsId, skuId, quantity
  });
};