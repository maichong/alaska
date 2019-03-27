"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_user_1 = require("alaska-user");
const __1 = require("../");
const Order_1 = require("../models/Order");
const Create_1 = require("../sleds/Create");
const Receive_1 = require("../sleds/Receive");
const Refund_1 = require("../sleds/Refund");
const Cancel_1 = require("../sleds/Cancel");
const Delete_1 = require("../sleds/Delete");
const Confirm_1 = require("../sleds/Confirm");
const Reject_1 = require("../sleds/Reject");
const Ship_1 = require("../sleds/Ship");
const AcceptRefund_1 = require("../sleds/AcceptRefund");
const RejectRefund_1 = require("../sleds/RejectRefund");
exports['pre-create'] = async function (ctx) {
    let body = ctx.state.body || ctx.request.body;
    if (!ctx.state.ignoreAuthorization) {
        if (!ctx.user)
            __1.default.error(401);
        if (!alaska_user_1.default.hasAbility(ctx.user, 'alaska-order.Order.create'))
            __1.default.error(403);
        body.user = ctx.user;
    }
    else {
        body = ctx.state.body || ctx.throw('Missing state.body when ignore authorization');
        if (!body.user) {
            body.user = ctx.user;
        }
    }
    body.pre = true;
    body.ctx = ctx;
    let orders = await Create_1.default.run(body, { dbSession: ctx.dbSession });
    let defaultAddress = null;
    const Address = Order_1.default.lookup('alaska-address.Address');
    const Shop = Order_1.default.lookup('alaska-shop.Shop');
    if (Address && !body.address) {
        let address = await Address.findOne({ user: body.user }).sort('-isDefault -createdAt');
        if (address) {
            defaultAddress = address.data();
        }
    }
    let results = [];
    for (let order of orders) {
        let data = order.data();
        await alaska_user_1.default.trimProtectedField(data, ctx.user, Order_1.default, order);
        if (!data.address) {
            data.address = defaultAddress;
        }
        if (Shop && order.shop) {
            let shop = await Shop.findById(order.shop);
            if (shop) {
                data.shop = shop.data();
            }
        }
        results.push(data);
    }
    ctx.body = {
        orders: results
    };
};
async function create(ctx) {
    let body = ctx.state.body || ctx.request.body;
    if (!ctx.state.ignoreAuthorization) {
        if (!ctx.user)
            __1.default.error(401);
        if (!alaska_user_1.default.hasAbility(ctx.user, 'alaska-order.Order.create'))
            __1.default.error(403);
        body.user = ctx.user;
    }
    else {
        body = ctx.state.body || ctx.throw('Missing state.body when ignore authorization');
        if (!body.user) {
            body.user = ctx.user;
        }
    }
    body.ctx = ctx;
    let orders = await Create_1.default.run(body, { dbSession: ctx.dbSession });
    const Shop = Order_1.default.lookup('alaska-shop.Shop');
    let results = [];
    for (let order of orders) {
        let data = order.data();
        if (Shop && order.shop) {
            let shop = await Shop.findById(order.shop);
            if (shop) {
                data.shop = shop.data();
            }
        }
        await alaska_user_1.default.trimProtectedField(data, ctx.user, Order_1.default, order);
        results.push(data);
    }
    ctx.body = {
        orders: results
    };
}
exports.create = create;
async function _cancel(ctx) {
    let order = ctx.state.record;
    if (!ctx.state.ignoreAuthorization) {
        if (!ctx.user)
            __1.default.error(401);
        if (!alaska_user_1.default.hasAbility(ctx.user, 'alaska-order.Order.cancel', order))
            __1.default.error(403);
    }
    await Cancel_1.default.run({ record: order }, { dbSession: ctx.dbSession });
    let data = order.data();
    await alaska_user_1.default.trimProtectedField(data, ctx.user, Order_1.default, order);
    ctx.body = data;
}
exports._cancel = _cancel;
async function _receive(ctx) {
    let order = ctx.state.record;
    if (!ctx.state.ignoreAuthorization) {
        if (!ctx.user)
            __1.default.error(401);
        if (!alaska_user_1.default.hasAbility(ctx.user, 'alaska-order.Order.receive', order))
            __1.default.error(403);
    }
    await Receive_1.default.run({ record: order }, { dbSession: ctx.dbSession });
    let data = order.data();
    await alaska_user_1.default.trimProtectedField(data, ctx.user, Order_1.default, order);
    ctx.body = data;
}
exports._receive = _receive;
async function _refund(ctx) {
    let order = ctx.state.record;
    let body = ctx.state.body || ctx.request.body;
    if (!ctx.state.ignoreAuthorization) {
        if (!ctx.user)
            __1.default.error(401);
        if (!alaska_user_1.default.hasAbility(ctx.user, 'alaska-order.Order.refund', order))
            __1.default.error(403);
    }
    else {
        body = ctx.state.body || ctx.throw('Missing state.body when ignore authorization');
    }
    let expressCode = body.expressCode || '';
    let reason = body.reason || '';
    let amount = body.amount || 0;
    let quantity = body.quantity || 0;
    let orderGoods = body.orderGoods || '';
    if (!amount) {
        amount = order.payed;
    }
    if (amount > order.payed)
        __1.default.error('Invalid refund amount');
    await Refund_1.default.run({
        record: order,
        expressCode,
        orderGoods,
        reason,
        amount,
        quantity
    }, { dbSession: ctx.dbSession });
    let data = order.data();
    await alaska_user_1.default.trimProtectedField(data, ctx.user, Order_1.default, order);
    ctx.body = data;
}
exports._refund = _refund;
async function remove(ctx) {
    if (!ctx.state.ignoreAuthorization) {
        if (!ctx.user)
            __1.default.error(401);
    }
    let order = ctx.state.order || await Order_1.default.findById(ctx.state.id || ctx.params.id).where('user', ctx.user._id).session(ctx.dbSession);
    if (order) {
        if (!ctx.state.ignoreAuthorization) {
            if (!alaska_user_1.default.hasAbility(ctx.user, 'alaska-order.Order.delete', order))
                __1.default.error(403);
        }
        await Delete_1.default.run({ record: order }, { dbSession: ctx.dbSession });
    }
    ctx.body = {};
}
exports.remove = remove;
async function _confirm(ctx) {
    let order = ctx.state.record;
    if (!ctx.state.ignoreAuthorization) {
        if (!ctx.user)
            __1.default.error(401);
        if (!alaska_user_1.default.hasAbility(ctx.user, 'alaska-order.Order.confirm', order))
            __1.default.error(403);
    }
    await Confirm_1.default.run({ record: order }, { dbSession: ctx.dbSession });
    let data = order.data();
    await alaska_user_1.default.trimProtectedField(data, ctx.user, Order_1.default, order);
    ctx.body = data;
}
exports._confirm = _confirm;
async function _reject(ctx) {
    let order = ctx.state.record;
    if (!ctx.state.ignoreAuthorization) {
        if (!ctx.user)
            __1.default.error(401);
        if (!alaska_user_1.default.hasAbility(ctx.user, 'alaska-order.Order.reject', order))
            __1.default.error(403);
    }
    await Reject_1.default.run({ record: order }, { dbSession: ctx.dbSession });
    let data = order.data();
    await alaska_user_1.default.trimProtectedField(data, ctx.user, Order_1.default, order);
    ctx.body = data;
}
exports._reject = _reject;
async function _ship(ctx) {
    let order = ctx.state.record;
    let body = ctx.state.body || ctx.request.body;
    if (!ctx.state.ignoreAuthorization) {
        if (!ctx.user)
            __1.default.error(401);
        if (!alaska_user_1.default.hasAbility(ctx.user, 'alaska-order.Order.ship', order))
            __1.default.error(403);
    }
    else {
        body = ctx.state.body || ctx.throw('Missing state.body when ignore authorization');
    }
    let expressCompany = body.expressCompany || '';
    let expressCode = body.expressCode || '';
    await Ship_1.default.run({ record: order, expressCompany, expressCode }, { dbSession: ctx.dbSession });
    let data = order.data();
    await alaska_user_1.default.trimProtectedField(data, ctx.user, Order_1.default, order);
    ctx.body = data;
}
exports._ship = _ship;
exports['_accept-refund'] = async function (ctx) {
    let order = ctx.state.record;
    if (!ctx.state.ignoreAuthorization) {
        if (!ctx.user)
            __1.default.error(401);
        if (!alaska_user_1.default.hasAbility(ctx.user, 'alaska-order.Order.acceptRefund', order))
            __1.default.error(403);
    }
    await AcceptRefund_1.default.run({ record: order }, { dbSession: ctx.dbSession });
    let data = order.data();
    await alaska_user_1.default.trimProtectedField(data, ctx.user, Order_1.default, order);
    ctx.body = data;
};
exports['_reject-refund'] = async function (ctx) {
    let order = ctx.state.record;
    if (!ctx.state.ignoreAuthorization) {
        if (!ctx.user)
            __1.default.error(401);
        if (!alaska_user_1.default.hasAbility(ctx.user, 'alaska-order.Order.rejectRefund', order))
            __1.default.error(403);
    }
    await RejectRefund_1.default.run({ record: order }, { dbSession: ctx.dbSession });
    let data = order.data();
    await alaska_user_1.default.trimProtectedField(data, ctx.user, Order_1.default, order);
    ctx.body = data;
};
