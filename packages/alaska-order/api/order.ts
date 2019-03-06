import { Context } from 'alaska-http';
import userService from 'alaska-user';
import service from '../';
import Order from '../models/Order';
import Create from '../sleds/Create';
import Receive from '../sleds/Receive';
import Refund from '../sleds/Refund';
import Cancel from '../sleds/Cancel';
import Delete from '../sleds/Delete';

/**
 * 买家预创建订单
 * @http-body {Array<{goods:strng; sku: string; quantity?: number;}>} goods 订单商品列表
 */
exports['pre-create'] = async function (ctx: Context) {
  let body = ctx.state.body || ctx.request.body;
  if (!ctx.state.ignoreAuthorization) {
    if (!ctx.user) service.error(401);
    if (!userService.hasAbility(ctx.user, 'alaska-order.Order.create')) service.error(403);
    body.user = ctx.user;
  } else {
    body = ctx.state.body || ctx.throw('Missing state.body when ignore authorization');
    if (!body.user) {
      body.user = ctx.user;
    }
  }
  body.pre = true;
  body.ctx = ctx;

  let orders = await Create.run(body);

  let results = [];
  for (let order of orders) {
    let data = order.data();
    await userService.trimProtectedField(data, ctx.user, Order, order);
    results.push(data);
  }
  ctx.body = {
    orders: results
  };
};

/**
 * 创建订单
 * @http-body {Array<{goods:strng | sku: string}>} goods 订单商品列表
 */
export async function create(ctx: Context) {
  let body = ctx.state.body || ctx.request.body;

  if (!ctx.state.ignoreAuthorization) {
    if (!ctx.user) service.error(401);
    if (!userService.hasAbility(ctx.user, 'alaska-order.Order.create')) service.error(403);
    body.user = ctx.user;
  } else {
    body = ctx.state.body || ctx.throw('Missing state.body when ignore authorization');
    if (!body.user) {
      body.user = ctx.user;
    }
  }

  body.ctx = ctx;

  let orders = await Create.run(body, { dbSession: ctx.dbSession });

  let results = [];
  for (let order of orders) {
    let data = order.data();
    await userService.trimProtectedField(data, ctx.user, Order, order);
    results.push(data);
  }
  ctx.body = {
    orders: results
  };
}

/**
 * 用户取消订单
 */
export async function _cancel(ctx: Context) {
  let order: Order = ctx.state.record;

  if (!ctx.state.ignoreAuthorization) {
    if (!ctx.user) service.error(401);
    if (!userService.hasAbility(ctx.user, 'alaska-order.Order.cancel', order)) service.error(403);
  }

  await Cancel.run({ record: order }, { dbSession: ctx.dbSession });

  let data = order.data();
  await userService.trimProtectedField(data, ctx.user, Order, order);
  ctx.body = data;
}

/**
 * 买家确认收货
 * @http-body {string} order 订单ID
 */
export async function _receive(ctx: Context) {
  let order: Order = ctx.state.record;

  if (!ctx.state.ignoreAuthorization) {
    if (!ctx.user) service.error(401);
    if (!userService.hasAbility(ctx.user, 'alaska-order.Order.receive', order)) service.error(403);
  }

  await Receive.run({ record: order }, { dbSession: ctx.dbSession });

  let data = order.data();
  await userService.trimProtectedField(data, ctx.user, Order, order);
  ctx.body = data;
}

/**
 * 买家申请退款
 * body.order 订单ID
 * body.reason 退款原因
 * body.amount 退款金额
 */
export async function _refund(ctx: Context) {
  let order: Order = ctx.state.record;

  let body = ctx.state.body || ctx.request.body;

  if (!ctx.state.ignoreAuthorization) {
    if (!ctx.user) service.error(401);
    if (!userService.hasAbility(ctx.user, 'alaska-order.Order.refund', order)) service.error(403);
  } else {
    body = ctx.state.body || ctx.throw('Missing state.body when ignore authorization');
  }


  let reason = body.reason || '';
  let amount = body.amount || 0;
  let quantity = body.quantity || 0;
  let orderGoods = body.orderGoods || '';

  if (!amount) {
    amount = order.payed;
  }
  if (amount > order.payed) service.error('Invalid refund amount');


  await Refund.run({
    record: order,
    orderGoods,
    reason,
    amount,
    quantity
  }, { dbSession: ctx.dbSession });

  let data = order.data();
  await userService.trimProtectedField(data, ctx.user, Order, order);
  ctx.body = data;
}

/**
 * 用户删除订单
 */
export async function remove(ctx: Context) {
  if (!ctx.state.ignoreAuthorization) {
    if (!ctx.user) service.error(401);
  }
  let order = ctx.state.order || await Order.findById(ctx.state.id || ctx.params.id).where('user', ctx.user._id).session(ctx.dbSession);
  if (order) {
    if (!ctx.state.ignoreAuthorization) {
      if (!userService.hasAbility(ctx.user, 'alaska-order.Order.delete', order)) service.error(403);
    }
    await Delete.run({ record: order }, { dbSession: ctx.dbSession });
  }
  ctx.body = {};
}

// TODO: 商家端 confirm
// TODO: 商家端 reject
// TODO: 商家端 ship
// TODO: 商家端 refund-accept
// TODO: 商家端 refund-reject

