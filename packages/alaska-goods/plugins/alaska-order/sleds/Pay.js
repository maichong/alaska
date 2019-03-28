"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Goods_1 = require("alaska-goods/models/Goods");
const OrderGoods_1 = require("alaska-order/models/OrderGoods");
const alaska_order_1 = require("alaska-order");
let skuService;
alaska_order_1.default.resolveConfig().then(() => {
    skuService = alaska_order_1.default.lookup('alaska-sku');
});
async function post() {
    let orders = this.result;
    for (let order of orders) {
        let items = await OrderGoods_1.default.find({ order: order._id }).session(this.dbSession);
        for (let item of items) {
            if (item.sku && skuService) {
                await skuService.models.Sku.incVolume(item.sku, item.quantity, this.dbSession);
            }
            else if (item.goods) {
                await Goods_1.default.incVolume(item.goods, item.quantity, this.dbSession);
            }
        }
    }
}
exports.post = post;
