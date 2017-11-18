// @flow

import service from '../';

export default async function create(ctx:Alaska$Context) {
  if (!ctx.user) service.error(403);
  let body = ctx.state.body || ctx.request.body;
  let goodsId = body.goods || ctx.request.body.goods;
  let skuId = body.sku || ctx.request.body.sku;
  let quantity = body.quantity || ctx.request.body.quantity;
  if (!goodsId) service.error(400);
  ctx.body = await service.run('Create', {
    user: ctx.user, goodsId, skuId, quantity
  });
}
