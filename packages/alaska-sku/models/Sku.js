"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
const Goods_1 = require("alaska-goods/models/Goods");
class Sku extends alaska_model_1.Model {
    static async incInventory(id, quantity, dbSession) {
        let newSku = await Sku.findOneAndUpdate({ _id: id }, { $inc: { inventory: quantity } }, { new: true }).session(dbSession);
        if (!newSku)
            return null;
        let goods = await Goods_1.default.findOneAndUpdate({ _id: newSku.goods, 'skus._id': newSku._id }, { $set: { 'skus.$.inventory': newSku.inventory } }, { new: true }).session(dbSession);
        if (goods) {
            await Goods_1.default.findOneAndUpdate({ _id: newSku.goods }, { $inc: { inventory: quantity } }).session(dbSession);
        }
        return newSku;
    }
    static async incVolume(id, quantity, dbSession) {
        let newSku = await Sku.findOneAndUpdate({ _id: id }, { $inc: { volume: quantity } }, { new: true }).session(dbSession);
        if (!newSku)
            return null;
        let goods = await Goods_1.default.findOneAndUpdate({ _id: newSku.goods, 'skus._id': newSku._id }, { $set: { 'skus.$.volume': newSku.volume } }, { new: true }).session(dbSession);
        if (goods) {
            await Goods_1.default.findOneAndUpdate({ _id: newSku.goods }, { $inc: { volume: quantity } }).session(dbSession);
        }
        return newSku;
    }
    preSave() {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }
    }
}
Sku.label = 'SKU';
Sku.icon = 'cubes';
Sku.defaultColumns = 'pic goods desc price discount volume inventory';
Sku.defaultSort = '-sort';
Sku.noupdate = true;
Sku.noremove = true;
Sku.nocreate = true;
Sku.titleField = 'desc';
Sku.searchFields = 'desc';
Sku.filterFields = 'goods shop price?range inventory?range volume?range @search';
Sku.fields = {
    pic: {
        label: 'Main Picture',
        type: 'image',
        required: true
    },
    goods: {
        label: 'Goods',
        type: 'relationship',
        ref: 'alaska-goods.Goods',
        index: true
    },
    shop: {
        label: 'Shop',
        type: 'relationship',
        ref: 'alaska-shop.Shop',
        optional: 'alaska-shop',
        hidden: true
    },
    key: {
        label: 'KEY',
        type: String,
        hidden: true,
        index: true
    },
    desc: {
        label: 'Description',
        type: String
    },
    price: {
        label: 'Price',
        type: 'money',
        min: 0
    },
    discount: {
        label: 'Discount',
        type: 'money',
        min: 0
    },
    inventory: {
        label: 'Inventory',
        type: Number,
        min: 0,
        default: 0
    },
    volume: {
        label: 'Volume',
        type: Number,
        default: 0,
        min: 0,
        protected: true
    },
    props: {
        label: 'Goods Properties',
        type: Object,
        hidden: true
    },
    createdAt: {
        label: 'Created At',
        type: Date
    }
};
exports.default = Sku;
