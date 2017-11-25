'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = create;
exports.receive = receive;
exports.refund = refund;
exports.confirm = confirm;
exports.reject = reject;
exports.ship = ship;

var _ = require('../');

var _2 = _interopRequireDefault(_);

var _Order = require('../models/Order');

var _Order2 = _interopRequireDefault(_Order);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 买家预创建订单
 * [body.goods] 订单商品列表
 */
exports['pre-create'] = async function (ctx) {
  let body = ctx.state.body || ctx.request.body;
  if (!body || ctx.method !== 'POST') _2.default.error(400);
  if (!ctx.user) _2.default.error(403);
  body.pre = true;
  body.user = ctx.user;
  body.ctx = ctx;
  body = await _2.default.run('Create', body);
  ctx.body = {
    orders: body.orders.map(o => o.data())
  };
};

/**
 * 买家创建订单
 * [body.address] 收货地址对象
 * [body.goods] 订单商品列表
 */
async function create(ctx) {
  let body = ctx.state.body || ctx.request.body;
  if (!body || ctx.method !== 'POST') _2.default.error(400);
  if (!ctx.user) _2.default.error(403);
  body.user = ctx.user;
  body.ctx = ctx;
  body = await _2.default.run('Create', body);
  ctx.body = {
    orders: body.orders.map(o => o.data())
  };
}

/**
 * 买家确认收货
 * body.order 订单ID
 */
async function receive(ctx) {
  let body = ctx.state.body || ctx.request.body;
  let orderId = body.order || ctx.request.body.order;
  if (!orderId || ctx.method !== 'POST') _2.default.error(400);
  if (!ctx.user) _2.default.error(403);
  let order;
  if (typeof orderId === 'object' && orderId instanceof _Order2.default) {
    order = orderId;
  } else {
    // $Flow
    let orderTmp = await _Order2.default.findById(orderId).where('user', ctx.user._id);
    order = orderTmp;
    if (!order) _2.default.error('Order not found');
    if (order.state !== 500) _2.default.error('Order state error');
  }
  await _2.default.run('Receive', { ctx, order });
  ctx.body = order.data();
}

/**
 * 买家申请退款
 * body.order 订单ID
 * body.reason 退款原因
 * body.amount 退款金额
 */
async function refund(ctx) {
  let order = ctx.state.order;
  let body = ctx.state.body || ctx.request.body;
  let orderId = body.order || ctx.request.body.order;
  let reason = body.reason || ctx.request.body.reason;
  let amount = body.amount || ctx.request.body.amount;
  if (!orderId && !order || ctx.method !== 'POST') _2.default.error(400);
  if (!ctx.user) _2.default.error(403);
  if (!reason) _2.default.error('Invalid refund reason');
  if (!order) {
    // $Flow
    let orderTmp = await _Order2.default.findById(orderId).where('user', ctx.user._id);
    order = orderTmp;
    if (!order) _2.default.error('Order not found');
    if (order.state !== 400 && order.state !== 500) _2.default.error('Order state error');
  }
  if (!amount) {
    amount = order.payed;
  }
  if (amount > order.payed) _2.default.error('Invalid refund amount');
  await _2.default.run('Refund', {
    ctx, order, reason, amount
  });
  ctx.body = order.data();
}

/**
 * 卖家或管理员 审核订单
 * 如果是多店铺模式,并且卖家无管理员权限,前置中间件请将order对象存放在ctx.state.order,并做好状态判断
 * body.order 订单ID
 */
async function confirm(ctx) {
  let order = ctx.state.order;
  let body = ctx.state.body || ctx.request.body;
  let orderId = body.order || ctx.request.body.order;
  if (!orderId && !order || ctx.method !== 'POST') _2.default.error(400);
  if (!ctx.user) _2.default.error(403);
  if (!order) {
    //要求商品管理权限
    await ctx.checkAbility('admin.alaska-order.order.update');
    // $Flow
    let orderTmp = await _Order2.default.findById(orderId);
    order = orderTmp;
    if (!order) _2.default.error('Order not found');
    if (order.state !== 300) _2.default.error('Order state error');
  }
  await _2.default.run('Confirm', { ctx, order });
  ctx.body = order.data();
}

/**
 * 卖家或管理员 拒绝订单
 * 如果是多店铺模式,并且卖家无管理员权限,前置中间件请将order对象存放在ctx.state.order,并做好状态判断
 * body.order 订单ID
 */
async function reject(ctx) {
  let order = ctx.state.order;
  let body = ctx.state.body || ctx.request.body;
  let orderId = body.order || ctx.request.body.order;
  if (!orderId && !order || ctx.method !== 'POST') _2.default.error(400);
  if (!ctx.user) _2.default.error(403);
  if (!order) {
    //要求商品管理权限
    await ctx.checkAbility('admin.alaska-order.order.update');
    // $Flow
    let orderTmp = await _Order2.default.findById(orderId);
    order = orderTmp;
    if (!order) _2.default.error('Order not found');
    if (order.state !== 300) _2.default.error('Order state error');
  }
  await _2.default.run('Reject', { ctx, order });
  ctx.body = order.data();
}

/**
 * 卖家或管理员 发货
 * 如果是多店铺模式,并且卖家无管理员权限,前置中间件请将order对象存放在ctx.state.order,并做好状态判断
 * body.order 订单ID
 */
async function ship(ctx) {
  let order = ctx.state.order;
  let body = ctx.state.body || ctx.request.body;
  let orderId = body.order || ctx.request.body.order;
  if (!orderId && !order || ctx.method !== 'POST') _2.default.error(400);
  if (!ctx.user) _2.default.error(403);
  if (!order) {
    //要求商品管理权限
    await ctx.checkAbility('admin.alaska-order.order.update');
    // $Flow
    let orderTmp = await _Order2.default.findById(orderId);
    order = orderTmp;
    if (!order) _2.default.error('Order not found');
    if (order.state !== 300) _2.default.error('Order state error');
  }
  await _2.default.run('Ship', { ctx, order });
  ctx.body = order.data();
}

/**
 * 卖家或管理员 审核退款
 * 如果是多店铺模式,并且卖家无管理员权限,前置中间件请将order对象存放在ctx.state.order,并做好状态判断
 * body.order 订单ID
 */
exports['refund-accept'] = async function (ctx) {
  let order = ctx.state.order;
  let body = ctx.state.body || ctx.request.body;
  let orderId = body.order || ctx.request.body.order;
  if (!orderId && !order || ctx.method !== 'POST') _2.default.error(400);
  if (!ctx.user) _2.default.error(403);
  if (!order) {
    //要求商品管理权限
    await ctx.checkAbility('admin.alaska-order.order.update');
    // $Flow
    let orderTmp = await _Order2.default.findById(orderId);
    order = orderTmp;
    if (!order) _2.default.error('Order not found');
    if (order.state !== 800) _2.default.error('Order state error');
  }
  await _2.default.run('RefundAccept', { ctx, order });
  ctx.body = order.data();
};

/**
 * 卖家或管理员 拒绝退款
 * 如果是多店铺模式,并且卖家无管理员权限,前置中间件请将order对象存放在ctx.state.order,并做好状态判断
 * body.order 订单ID
 */
exports['refund-reject'] = async function (ctx) {
  let order = ctx.state.order;
  let body = ctx.state.body || ctx.request.body;
  let orderId = body.order || ctx.request.body.order;
  if (!orderId && !order || ctx.method !== 'POST') _2.default.error(400);
  if (!ctx.user) _2.default.error(403);
  if (!order) {
    //要求商品管理权限
    await ctx.checkAbility('admin.alaska-order.order.update');
    // $Flow
    let orderTmp = await _Order2.default.findById(orderId);
    order = orderTmp;
    if (!order) _2.default.error('Order not found');
    if (order.state !== 800) _2.default.error('Order state error');
  }
  await _2.default.run('RefundReject', { ctx, order });
  ctx.body = order.data();
};

/**
 * 用户取消订单
 * @param ctx
 */
exports.cancel = async function (ctx) {
  let order = ctx.state.order;
  let body = ctx.state.body || ctx.request.body;
  let orderId = body.order || ctx.request.body.order;
  if (!orderId && !order || ctx.method !== 'POST') _2.default.error(400);
  if (!ctx.user) _2.default.error(403);
  if (!order) {
    // $Flow
    let orderTmp = await _Order2.default.findById(orderId).where('user', ctx.user._id);
    order = orderTmp;
  }
  if (!order) _2.default.error('Order not found');
  await _2.default.run('Cancel', { ctx, order });
  ctx.body = {};
};

/**
 * 用户删除订单
 * @param ctx
 */
exports.remove = async function (ctx) {
  if (!ctx.user) _2.default.error(403);
  // $Flow
  let order = await _Order2.default.findById(ctx.state.id || ctx.params.id).where('user', ctx.user._id);
  if (order) {
    await _2.default.run('Delete', { ctx, order });
  }
  ctx.body = {};
};