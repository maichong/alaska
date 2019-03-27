"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const alaska_user_1 = require("alaska-user");
const Goods_1 = require("alaska-goods/models/Goods");
const CartGoods_1 = require("../models/CartGoods");
const Create_1 = require("../sleds/Create");
const __1 = require("..");
async function create(ctx) {
    let body = ctx.state.body || ctx.request.body;
    if (!ctx.state.ignoreAuthorization) {
        if (!ctx.user)
            __1.default.error(401);
        body.user = ctx.user._id;
    }
    else {
        body = ctx.state.body || ctx.throw('Missing state.body when ignore authorization');
        if (!body.user && ctx.user) {
            body.user = ctx.user._id;
        }
    }
    let goods = body.goods || __1.default.error('goods is required!', 400);
    let sku = body.sku;
    let quantity = body.quantity;
    let record = await Create_1.default.run({
        user: body.user || ctx.user._id, goods, sku, quantity
    }, { dbSession: ctx.dbSession });
    ctx.state.record = record;
    let data = record.data('create');
    data.inventory = record.inventory;
    ctx.body = data;
}
exports.create = create;
async function update(ctx) {
    if (!ctx.state.ignoreAuthorization) {
        if (!ctx.user)
            __1.default.error(401);
    }
    let id = ctx.state.id || ctx.params.id || ctx.throw(400);
    let body = ctx.state.body || ctx.request.body;
    let record = await CartGoods_1.default.findById(id).session(ctx.dbSession);
    if (!record)
        ctx.throw(404);
    if (!ctx.state.ignoreAuthorization) {
        if (!await alaska_user_1.default.hasAbility(ctx.user, 'alaska-cart.CartGoods.update', record))
            ctx.throw(403);
        body.user = ctx.user.id;
    }
    else {
        body = ctx.state.body || ctx.throw('Missing state.body when ignore authorization');
        if (!body.user && ctx.user) {
            body.user = ctx.user._id;
        }
    }
    record = await Create_1.default.run({
        user: body.user,
        goods: record.goods,
        sku: record.sku,
        quantity: body.quantity,
        replaceQuantity: true
    }, { dbSession: ctx.dbSession });
    ctx.state.record = record;
    let data = record.data('create');
    data.inventory = record.inventory;
    ctx.body = data;
}
exports.update = update;
async function list(ctx, next) {
    if (!ctx.user)
        __1.default.error(401);
    await next();
    const goodsMap = new Map();
    for (let data of ctx.body) {
        let g = goodsMap.get(data.goods);
        if (!g) {
            g = await Goods_1.default.findById(data.goods);
            if (!g)
                continue;
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
exports.list = list;
