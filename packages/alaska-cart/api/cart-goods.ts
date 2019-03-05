import * as _ from 'lodash';
import { Context } from 'alaska-http';
import userService from 'alaska-user';
import Goods from 'alaska-goods/models/Goods';
import CartGoods from '../models/CartGoods';
import Create from '../sleds/Create';
import service from '..';

export async function create(ctx: Context) {
  let body = ctx.state.body || ctx.request.body;

  if (!ctx.state.ignoreAuthorization) {
    if (!ctx.user) service.error(401);
    body.user = ctx.user._id;
  } else {
    body = ctx.state.body || ctx.throw('Missing state.body when ignore authorization');
    if (!body.user && ctx.user) {
      body.user = ctx.user._id;
    }
  }

  let goods: string = body.goods || service.error('goods is required!', 400);
  let sku: string = body.sku;
  let quantity: number = body.quantity;

  let record = await Create.run({
    user: body.user || ctx.user._id, goods, sku, quantity
  }, { dbSession: ctx.dbSession });

  ctx.state.record = record;
  let data = record.data('create');

  // @ts-ignore
  data.inventory = record.inventory;
  ctx.body = data;
}

export async function update(ctx: Context) {
  if (!ctx.state.ignoreAuthorization) {
    if (!ctx.user) service.error(401);
  }

  let id = ctx.state.id || ctx.params.id || ctx.throw(400);

  let body = ctx.state.body || ctx.request.body;
  let record = await CartGoods.findById(id).session(ctx.dbSession);
  if (!record) ctx.throw(404);

  if (!ctx.state.ignoreAuthorization) {
    if (!await userService.hasAbility(ctx.user, 'alaska-cart.CartGoods.update', record)) ctx.throw(403);
    body.user = ctx.user.id;
  } else {
    body = ctx.state.body || ctx.throw('Missing state.body when ignore authorization');
    if (!body.user && ctx.user) {
      body.user = ctx.user._id;
    }
  }

  record = await Create.run({
    user: body.user,
    goods: record.goods,
    sku: record.sku,
    quantity: body.quantity,
    replaceQuantity: true
  }, { dbSession: ctx.dbSession });

  ctx.state.record = record;
  let data = record.data('create');

  // @ts-ignore
  data.inventory = record.inventory;
  ctx.body = data;
}

export async function list(ctx: Context, next: Function) {
  if (!ctx.user) service.error(401);
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
