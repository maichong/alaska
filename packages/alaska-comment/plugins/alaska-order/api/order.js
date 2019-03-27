"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const utils_1 = require("alaska-model/utils");
const Goods_1 = require("alaska-goods/models/Goods");
const OrderGoods_1 = require("alaska-order/models/OrderGoods");
const Comment_1 = require("../../../models/Comment");
const __1 = require("../../..");
async function _comment(ctx) {
    let body = ctx.state.body || ctx.request.body;
    if (_.isEmpty(body.goods) || !Array.isArray(body.goods)) {
        __1.default.error('goods is required!');
    }
    let order = ctx.state.record;
    if (!utils_1.isIdEqual(ctx.user, order.user))
        __1.default.error(403);
    if (order.commented)
        __1.default.error('Order already commented');
    let goods = await OrderGoods_1.default.find({ _id: { $in: order.goods } }).session(ctx.dbSession);
    let goodsMap = _.keyBy(goods, 'id');
    let commentMap = new Map();
    for (let item of body.goods) {
        let { content, pics, orderGoods } = item;
        if (!content)
            __1.default.error('goods[].content is required!');
        if (!orderGoods)
            __1.default.error('goods[].orderGoods is required!');
        if (commentMap.has(orderGoods))
            __1.default.error('duplicated orderGoods!');
        if (!goodsMap.hasOwnProperty(orderGoods))
            __1.default.error('order goods not found!');
        let og = goodsMap[orderGoods];
        if (og.comment)
            __1.default.error('order goods already commented!');
        let comment = new Comment_1.default({
            type: 'goods',
            user: ctx.user._id,
            order: order._id,
            orderGoods: og._id,
            goods: og.goods,
            sku: og.sku,
            skuDesc: og.skuDesc,
            content,
            pics,
        });
        og.comment = comment._id;
        commentMap.set(orderGoods, comment);
    }
    let results = [];
    for (let c of commentMap.values()) {
        await c.save({ session: ctx.dbSession });
        results.push(c.data());
    }
    for (let g of goods) {
        if (g.isModified('comment')) {
            await g.save({ session: ctx.dbSession });
            await Goods_1.default.findByIdAndUpdate(g.goods, {
                $inc: {
                    commentCount: 1
                }
            }).session(ctx.dbSession);
        }
    }
    order.commented = true;
    await order.save({ session: ctx.dbSession });
    ctx.body = results;
}
exports._comment = _comment;
