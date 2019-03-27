"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const Goods_1 = require("alaska-goods/models/Goods");
const alaska_order_1 = require("alaska-order");
const Order_1 = require("alaska-order/models/Order");
const OrderGoods_1 = require("alaska-order/models/OrderGoods");
const alaska_1 = require("alaska");
let skuService;
alaska_order_1.default.resolveConfig().then(() => {
    skuService = alaska_order_1.default.main.allServices.get('alaska-sku');
});
let cartService;
alaska_order_1.default.resolveConfig().then(() => {
    cartService = alaska_order_1.default.main.allServices.get('alaska-cart');
});
async function pre() {
    let params = this.params;
    let gids = params.goods;
    if (!gids || !gids.length) {
        return;
    }
    params.records = params.records || [];
    let orders = params.records;
    let address = params.address;
    if (address && !_.isPlainObject(address)) {
        const Address = Order_1.default.lookup('alaska-address.Address');
        address = await Address.findById(address).where('user', params.user._id);
        if (!address)
            throw new alaska_1.NormalError('Address not found');
        address = address.data();
    }
    let orderItems = [];
    let goodsMap = new Map();
    for (let g of gids) {
        if (!g.goods)
            continue;
        let goods = await Goods_1.default.findById(g.goods).session(this.dbSession);
        if (!goods)
            alaska_order_1.default.error('Goods not found');
        if (!goods.activated)
            alaska_order_1.default.error('Goods is not activated');
        goodsMap.set(goods.id, goods);
        let discountValid = goods.discountValid;
        let item = new OrderGoods_1.default({
            pic: goods.pic,
            goods: goods._id,
            user: params.user._id,
            store: goods.store,
            shop: goods.shop,
            title: goods.title,
            currency: goods.currency,
            price: goods.price,
            shipping: goods.shipping || 0,
            discount: discountValid ? goods.discount : 0,
            quantity: parseInt(g.quantity) || 1
        });
        let sku;
        if (g.sku) {
            sku = await skuService.models.Sku.findById(g.sku).where('goods', goods._id).session(this.dbSession);
            if (!sku)
                alaska_order_1.default.error('Sku not found');
            if (!sku.inventory)
                alaska_order_1.default.error('Goods have been sold out');
            if (!_.find(goods.skus, (s) => s.key === sku.key))
                alaska_order_1.default.error('Goods have been sold out');
            item.price = sku.price;
            item.discount = discountValid ? sku.discount : 0;
            item.sku = sku._id;
            item.skuKey = sku.key;
            item.skuDesc = sku.desc;
            if (sku.pic) {
                if (typeof sku.pic === 'string' || sku.pic.url) {
                    item.pic = sku.pic;
                }
            }
            if (item.quantity > sku.inventory)
                alaska_order_1.default.error('Inventory shortage');
        }
        else if (goods.skus && goods.skus.length) {
            alaska_order_1.default.error('Please select goods props');
        }
        else if (!goods.inventory) {
            alaska_order_1.default.error('Goods have been sold out');
        }
        else {
        }
        if (!sku && item.quantity > goods.inventory)
            alaska_order_1.default.error('Inventory shortage');
        item.total = item.quantity * (item.discount || item.price);
        orderItems.push(item);
    }
    _.forEach(orderItems, (item) => {
        let order = _.find(orders, (o) => o.type === 'goods' && o.canAppendGoods(item));
        if (order) {
            item.order = order._id;
            order.goods.push(item);
        }
        else {
            order = new Order_1.default({
                title: item.title,
                type: 'goods',
                pic: item.pic,
                user: params.user._id,
                store: item.store,
                shop: item.shop,
                currency: item.currency,
                state: 200,
                delivery: params.delivery,
                message: params.message,
            });
            item.order = order._id;
            order.address = address;
            order.goods = [item];
            orders.push(order);
        }
    });
    _.forEach(orders, (order) => {
        if (order.type !== 'goods')
            return;
        let shipping = 0;
        let total = 0;
        let quantityByGoods = new Map();
        for (let item of order.goods) {
            let quantity = parseInt(item.quantity) || 1;
            let qty = quantityByGoods.get(item.id) || 0;
            quantityByGoods.set(String(item.goods), qty + quantity);
        }
        for (let [goodsId, qty] of quantityByGoods) {
            let goods = goodsMap.get(goodsId);
            if (goods && goods.shipping) {
                let ship = 0;
                if (!goods.shippingShareLimit) {
                    ship = goods.shipping;
                }
                else {
                    let times = Math.ceil(qty / goods.shippingShareLimit);
                    ship = times * goods.shipping;
                }
                shipping += ship;
            }
        }
        _.forEach(order.goods, (item) => {
            total += item.total || 0;
        });
        order.shipping = shipping;
        order.total = total;
        order.pay = shipping + total;
    });
}
exports.pre = pre;
async function post() {
    let { goods, user, records } = this.params;
    if (this.params.pre)
        return;
    if (_.isEmpty(goods))
        return;
    if (cartService && user) {
        const CartGoods = cartService.models.CartGoods;
        for (let g of goods) {
            let conditions = { user, goods: g.goods };
            if (g.sku) {
                conditions.sku = g.sku;
            }
            await CartGoods.deleteMany(conditions).session(this.dbSession);
        }
    }
    let orders = this.result;
    for (let order of (orders || records)) {
        let items = await OrderGoods_1.default.find({ order: order._id }).session(this.dbSession);
        for (let item of items) {
            if (item.sku && skuService) {
                await skuService.models.Sku.incInventory(item.sku, -item.quantity, this.dbSession);
            }
            else if (item.goods) {
                await Goods_1.default.incInventory(item.goods, -item.quantity, this.dbSession);
            }
        }
    }
}
exports.post = post;
