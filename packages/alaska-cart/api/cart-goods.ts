import { Context } from 'alaska-http';
import Create from '../sleds/Create';
import service from '..';

export async function create(ctx: Context) {
  if (!ctx.user) service.error(403);
  let body = ctx.state.body || ctx.request.body;
  let goods = body.goods || ctx.request.body.goods;
  let sku = body.sku || ctx.request.body.sku;
  let quantity = body.quantity || ctx.request.body.quantity;
  if (!goods) service.error(400);
  let record = await Create.run({
    user: ctx.user, goods, sku, quantity
  });
  ctx.state.record = record;
  ctx.body = record.data('create');
}
