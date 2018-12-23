import * as _ from 'lodash';
import { Context } from 'alaska-http';
import Goods from 'alaska-goods/models/Goods';
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

export async function list(ctx: Context, next: Function) {
  await next();
  const goodsMap: Map<string, Goods> = new Map();
  for (let data of ctx.body) {
    let goods = goodsMap.get(data.goods);
    if (!goods) {
      goods = await Goods.findById(data.goods);
      if (!goods) continue;
      goodsMap.set(data.goods, goods);
    }
    data.inventory = goods.inventory;
    if (data.sku) {
      let sku = _.find(goods.skus, (s) => s._id.toString() === data.sku);
      if (sku) {
        data.inventory = sku.inventory;
      }
    }
  }
}
