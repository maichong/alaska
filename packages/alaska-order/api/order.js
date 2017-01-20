// @flow

import service from '../';
import Order from '../models/Order';

/**
 * 买家预创建订单
 * [body.goods] 订单商品列表
 */
exports['pre-create'] = async function (ctx: Alaska$Context) {
  let body = ctx.state.body || ctx.request.body;
  if (!body || ctx.method !== 'POST') service.error(400);
  if (!ctx.user) service.error(403);
  body.pre = true;
  body.user = ctx.user;
  body.ctx = ctx;
  body = await service.run('Create', body);
  ctx.body = {
    orders: body.orders.map((o) => o.data())
  };
};

/**
 * 买家创建订单
 * [body.address] 收货地址对象
 * [body.goods] 订单商品列表
 */
export async function create(ctx: Alaska$Context) {
  let body = ctx.state.body || ctx.request.body;
  if (!body || ctx.method !== 'POST') service.error(400);
  if (!ctx.user) service.error(403);
  body.user = ctx.user;
  body.ctx = ctx;
  body = await service.run('Create', body);
  ctx.body = {
    orders: body.orders.map((o) => o.data())
  };
}

/**
 * 买家确认收货
 * body.order 订单ID
 */
export async function receive(ctx: Alaska$Context) {
  let body = ctx.state.body || ctx.request.body;
  let orderId = body.order || ctx.request.body.order;
  if (!orderId || ctx.method !== 'POST') service.error(400);
  if (!ctx.user) service.error(403);
  let order: ?Order;
  if (typeof orderId === 'object' && orderId instanceof Order) {
    order = orderId;
  } else {
    // $Flow
    let orderTmp: Order = await Order.findById(orderId).where('user', ctx.user._id);
    order = orderTmp;
    if (!order) service.error('Order not found');
    if (order.state !== 500) service.error('Order state error');
  }
  await service.run('Receive', { ctx, order });
  ctx.body = order.data();
}

/**
 * 买家申请退款
 * body.order 订单ID
 * body.reason 退款原因
 * body.amount 退款金额
 */
export async function refund(ctx: Alaska$Context) {
  let order: ?Order = ctx.state.order;
  let body = ctx.state.body || ctx.request.body;
  let orderId = body.order || ctx.request.body.order;
  let reason = body.reason || ctx.request.body.reason;
  let amount = body.amount || ctx.request.body.amount;
  if ((!orderId && !order) || ctx.method !== 'POST') service.error(400);
  if (!ctx.user) service.error(403);
  if (!reason) service.error('Invalid refund reason');
  if (!order) {
    // $Flow
    let orderTmp: Order = await Order.findById(orderId).where('user', ctx.user._id);
    order = orderTmp;
    if (!order) service.error('Order not found');
    if (order.state !== 400 && order.state !== 500) service.error('Order state error');
  }
  if (!amount) {
    amount = order.payed;
  }
  if (amount > order.payed) service.error('Invalid refund amount');
  await service.run('Refund', { ctx, order, reason, amount });
  ctx.body = order.data();
}

/**
 * 卖家或管理员 审核订单
 * 如果是多店铺模式,并且卖家无管理员权限,前置中间件请将order对象存放在ctx.state.order,并做好状态判断
 * body.order 订单ID
 */
export async function confirm(ctx: Alaska$Context) {
  let order: ?Order = ctx.state.order;
  let body = ctx.state.body || ctx.request.body;
  let orderId = body.order || ctx.request.body.order;
  if ((!orderId && !order) || ctx.method !== 'POST') service.error(400);
  if (!ctx.user) service.error(403);
  if (!order) {
    //要求商品管理权限
    await ctx.checkAbility('admin.alaska-order.order.update');
    // $Flow
    let orderTmp: Order = await Order.findById(orderId);
    order = orderTmp;
    if (!order) service.error('Order not found');
    if (order.state !== 300) service.error('Order state error');
  }
  await service.run('Confirm', { ctx, order });
  ctx.body = order.data();
}

/**
 * 卖家或管理员 拒绝订单
 * 如果是多店铺模式,并且卖家无管理员权限,前置中间件请将order对象存放在ctx.state.order,并做好状态判断
 * body.order 订单ID
 */
export async function reject(ctx: Alaska$Context) {
  let order: ?Order = ctx.state.order;
  let body = ctx.state.body || ctx.request.body;
  let orderId = body.order || ctx.request.body.order;
  if ((!orderId && !order) || ctx.method !== 'POST') service.error(400);
  if (!ctx.user) service.error(403);
  if (!order) {
    //要求商品管理权限
    await ctx.checkAbility('admin.alaska-order.order.update');
    // $Flow
    let orderTmp: Order = await Order.findById(orderId);
    order = orderTmp;
    if (!order) service.error('Order not found');
    if (order.state !== 300) service.error('Order state error');
  }
  await service.run('Reject', { ctx, order });
  ctx.body = order.data();
}

/**
 * 卖家或管理员 发货
 * 如果是多店铺模式,并且卖家无管理员权限,前置中间件请将order对象存放在ctx.state.order,并做好状态判断
 * body.order 订单ID
 */
export async function ship(ctx: Alaska$Context) {
  let order: ?Order = ctx.state.order;
  let body = ctx.state.body || ctx.request.body;
  let orderId = body.order || ctx.request.body.order;
  if ((!orderId && !order) || ctx.method !== 'POST') service.error(400);
  if (!ctx.user) service.error(403);
  if (!order) {
    //要求商品管理权限
    await ctx.checkAbility('admin.alaska-order.order.update');
    // $Flow
    let orderTmp: Order = await Order.findById(orderId);
    order = orderTmp;
    if (!order) service.error('Order not found');
    if (order.state !== 300) service.error('Order state error');
  }
  await service.run('Ship', { ctx, order });
  ctx.body = order.data();
}

/**
 * 卖家或管理员 审核退款
 * 如果是多店铺模式,并且卖家无管理员权限,前置中间件请将order对象存放在ctx.state.order,并做好状态判断
 * body.order 订单ID
 */
exports['refund-accept'] = async function (ctx: Alaska$Context) {
  let order: ?Order = ctx.state.order;
  let body = ctx.state.body || ctx.request.body;
  let orderId = body.order || ctx.request.body.order;
  if ((!orderId && !order) || ctx.method !== 'POST') service.error(400);
  if (!ctx.user) service.error(403);
  if (!order) {
    //要求商品管理权限
    await ctx.checkAbility('admin.alaska-order.order.update');
    // $Flow
    let orderTmp: Order = await Order.findById(orderId);
    order = orderTmp;
    if (!order) service.error('Order not found');
    if (order.state !== 800) service.error('Order state error');
  }
  await service.run('RefundAccept', { ctx, order });
  ctx.body = order.data();
};


/**
 * 卖家或管理员 拒绝退款
 * 如果是多店铺模式,并且卖家无管理员权限,前置中间件请将order对象存放在ctx.state.order,并做好状态判断
 * body.order 订单ID
 */
exports['refund-reject'] = async function (ctx: Alaska$Context) {
  let order: Order = ctx.state.order;
  let body = ctx.state.body || ctx.request.body;
  let orderId = body.order || ctx.request.body.order;
  if ((!orderId && !order) || ctx.method !== 'POST') service.error(400);
  if (!ctx.user) service.error(403);
  if (!order) {
    //要求商品管理权限
    await ctx.checkAbility('admin.alaska-order.order.update');
    // $Flow
    let orderTmp: Order = await Order.findById(orderId);
    order = orderTmp;
    if (!order) service.error('Order not found');
    if (order.state !== 800) service.error('Order state error');
  }
  await service.run('RefundReject', { ctx, order });
  ctx.body = order.data();
};

/**
 * 用户取消订单
 * @param ctx
 */
exports.cancel = async function (ctx: Alaska$Context) {
  let order: Order = ctx.state.order;
  let body = ctx.state.body || ctx.request.body;
  let orderId = body.order || ctx.request.body.order;
  if ((!orderId && !order) || ctx.method !== 'POST') service.error(400);
  if (!ctx.user) service.error(403);
  if (!order) {
    // $Flow
    let orderTmp: Order = await Order.findById(orderId).where('user', ctx.user._id);
    order = orderTmp;
  }
  if (!order) service.error('Order not found');
  await service.run('Cancel', { ctx, order });
  ctx.body = {};
};

/**
 * 用户删除订单
 * @param ctx
 */
exports.remove = async function (ctx: Alaska$Context) {
  if (!ctx.user) service.error(403);
  // $Flow
  let order = await Order.findById(ctx.state.id || ctx.params.id).where('user', ctx.user._id);
  if (order) {
    await service.run('Delete', { ctx, order });
  }
  ctx.body = {};
};
