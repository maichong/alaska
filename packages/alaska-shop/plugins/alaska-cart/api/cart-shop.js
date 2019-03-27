"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const Goods_1 = require("alaska-goods/models/Goods");
const CartGoods_1 = require("alaska-cart/models/CartGoods");
const Shop_1 = require("../../../models/Shop");
const __1 = require("../../..");
async function list(ctx) {
    if (!ctx.user)
        __1.default.error(401);
    let goods = _.map(await CartGoods_1.default.find({ user: ctx.user._id }), (g) => g.data());
    const shopMap = new Map();
    const goodsMap = new Map();
    for (let data of goods) {
        let shopId = String(data.shop || '');
        let goodsId = String(data.goods);
        let info = shopMap.get(shopId || '');
        if (!info) {
            let shop;
            if (data.shop) {
                shop = await Shop_1.default.findById(data.shop);
            }
            info = [shop, [data]];
            shopMap.set(shopId, info);
        }
        else {
            info[1].push(data);
        }
        let g = goodsMap.get(goodsId);
        if (!g) {
            g = await Goods_1.default.findById(data.goods);
            if (!g)
                continue;
            goodsMap.set(goodsId, g);
        }
        data.inventory = g.inventory;
        if (data.sku) {
            let sku = _.find(g.skus, (s) => String(s.id) === String(data.sku));
            if (sku) {
                data.inventory = sku.inventory;
            }
        }
    }
    let body = [];
    for (let info of shopMap.values()) {
        let shop = info[0] ? info[0].data() : { id: '', title: '' };
        shop.goods = info[1];
        body.push(shop);
    }
    ctx.body = body;
}
exports.list = list;
