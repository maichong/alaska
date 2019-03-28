"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const alaska_sled_1 = require("alaska-sled");
const Goods_1 = require("alaska-goods/models/Goods");
const Inventory_1 = require("../models/Inventory");
const __1 = require("..");
let skuService;
__1.default.resolveConfig().then(() => {
    skuService = __1.default.lookup('alaska-sku');
});
async function doInput(body, session) {
    let record = new Inventory_1.default({
        user: body.user,
        type: body.type,
        desc: body.desc,
        goods: body.goods,
        sku: body.sku,
        quantity: body.quantity,
    });
    if (!body.sku && !body.goods)
        __1.default.error('goods or sku is required');
    let goods;
    let sku;
    if (body.sku && skuService) {
        sku = await skuService.models.Sku.findById(body.sku);
        if (!sku)
            __1.default.error('Sku not found');
        goods = await Goods_1.default.findById(goods);
    }
    if (!goods) {
        goods = await Goods_1.default.findById(body.goods);
        if (!goods)
            __1.default.error('Goods not found');
    }
    if (skuService && !sku && _.size(goods.skus) === 1) {
        sku = await skuService.models.Sku.findById(goods.skus[0]._id);
    }
    if (sku) {
        let newSku = await skuService.models.Sku.incInventory(sku._id, body.quantity);
        if (!newSku)
            throw new Error('Failed to update sku inventory');
        record.inventory = newSku.inventory;
    }
    else {
        if (_.size(goods.skus))
            __1.default.error('goods sku is required');
        let newGoods = await Goods_1.default.incInventory(goods._id, body.quantity);
        if (newGoods) {
            record.inventory = newGoods.inventory;
        }
        else {
            __1.default.error('Goods not found');
        }
    }
    await record.save({ session });
    return record;
}
class Create extends alaska_sled_1.Sled {
    async exec(params) {
        if (this.result)
            return;
        let body = params.body;
        body.quantity = parseInt(body.quantity);
        body.user = (params.admin || params.user)._id;
        if (!body.quantity || body.quantity < 1)
            __1.default.error('Invalid quantity');
        if (body.type === 'output') {
            body.quantity = -body.quantity;
        }
        else {
            body.type = 'input';
        }
        return await doInput(body, this.dbSession);
    }
}
exports.default = Create;
