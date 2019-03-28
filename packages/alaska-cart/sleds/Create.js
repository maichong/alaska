"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_sled_1 = require("alaska-sled");
const Goods_1 = require("alaska-goods/models/Goods");
const CartGoods_1 = require("../models/CartGoods");
const alaska_cart_1 = require("alaska-cart");
let skuService;
alaska_cart_1.default.resolveConfig().then(() => {
    skuService = alaska_cart_1.default.lookup('alaska-sku');
});
class Create extends alaska_sled_1.Sled {
    async exec(params) {
        let skuId = params.sku;
        let sku;
        let goods = await Goods_1.default.findById(params.goods).session(this.dbSession);
        if (!goods)
            alaska_cart_1.default.error('Goods not found');
        let inventory = goods.inventory;
        if (!skuId && goods.skus && goods.skus.length === 1) {
            skuId = goods.skus[0]._id;
        }
        if (params.sku && skuService) {
            sku = await skuService.models.Sku.findById(skuId).where({ goods: goods._id }).session(this.dbSession);
            if (!sku)
                alaska_cart_1.default.error('Sku not found');
            inventory = sku.inventory;
        }
        if (goods.skus && goods.skus.length && !sku) {
            alaska_cart_1.default.error('Please select sku');
        }
        let discountValid = goods.discountValid;
        let discount = discountValid ? goods.discount : 0;
        let filters = { user: params.user, goods: goods._id };
        if (sku) {
            discount = discountValid ? sku.discount : 0;
            filters.sku = sku._id;
        }
        let record = await CartGoods_1.default.findOne(filters).session(this.dbSession);
        if (!record) {
            record = new CartGoods_1.default(filters);
            record.quantity = 0;
        }
        let quantity = parseInt(params.quantity) || 1;
        if (params.replaceQuantity) {
            record.quantity = quantity;
        }
        else {
            record.quantity += quantity;
        }
        if (record.quantity > inventory) {
            record.quantity = inventory;
        }
        record.pic = goods.pic;
        if (sku && sku.pic) {
            if (typeof sku.pic === 'string' || sku.pic.url) {
                record.pic = sku.pic;
            }
        }
        record.title = goods.title;
        record.shop = goods.shop;
        record.currency = goods.currency;
        record.price = sku ? sku.price : goods.price;
        record.discount = discount;
        record.skuDesc = sku ? sku.desc : '';
        await record.save({ session: this.dbSession });
        record.inventory = inventory;
        return record;
    }
}
exports.default = Create;
