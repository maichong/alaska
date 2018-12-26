import * as _ from 'lodash';
import { Context } from 'alaska-http';
import userService from 'alaska-user';
import Goods from 'alaska-goods/models/Goods';
import CartGoods from '../models/CartGoods';
import Create from '../sleds/Create';
import service from '..';

export async function create(ctx: Context) {
  if (!ctx.user) service.error(403);
  let body = ctx.state.body || ctx.request.body;
  let goods: string = body.goods || ctx.request.body.goods;
  let sku: string = body.sku || ctx.request.body.sku;
  let quantity: number = body.quantity || ctx.request.body.quantity;
  if (!goods) service.error(400);
  let record = await Create.run({
    user: ctx.user._id, goods, sku, quantity
  });
  ctx.state.record = record;
  let data = record.data('create');
  // @ts-ignore
  data.inventory = record.inventory;
  ctx.body = data;
}

export async function update(ctx: Context) {
  let id = ctx.state.id || ctx.params.id || ctx.throw(400);
  let body = ctx.state.body || ctx.request.body;
  let record = await CartGoods.findById(id);
  if (!record) ctx.throw(404);
  if (!await userService.hasAbility(ctx.user, 'alaska-cart.CartGoods.update', record)) ctx.throw(403);

  record = await Create.run({
    user: ctx.user._id,
    goods: record.goods,
    sku: record.sku,
    quantity: body.quantity,
    replaceQuantity: true
  });
  ctx.state.record = record;
  let data = record.data('create');
  // @ts-ignore
  data.inventory = record.inventory;
  ctx.body = data;
}

export async function list(ctx: Context, next: Function) {
  await next();
  const goodsMap: Map<string, Goods> = new Map();
  for (let data of ctx.body) {
    let g = goodsMap.get(data.goods);
    if (!g) {
      g = await Goods.findById(data.goods);
      if (!g) continue;
      goodsMap.set(data.goods, g);
    }
    data.inventory = g.inventory;
    if (data.sku) {
      let sku = _.find(g.skus, (s) => String(s.id) === String(data.sku));
      if (sku) {
        data.inventory = sku.inventory;
      }
    }
  }
}
