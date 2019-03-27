"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const utils_1 = require("alaska-model/utils");
const Sku_1 = require("../../../models/Sku");
exports.default = {
    groups: {
        sku: {
            title: 'SKU',
            panel: false,
            after: 'props'
        }
    },
    fields: {
        skus: {
            type: Sku_1.default,
            multi: true,
            view: 'SkuEditor',
            group: 'sku'
        },
    },
    async preSave() {
        if (!_.size(this.skus))
            return;
        let dbSession = this.$session();
        let skus = await Sku_1.default.find({ goods: this._id }).session(dbSession);
        let skusMap = _.keyBy(skus, 'key');
        let inventory = 0;
        let volume = 0;
        let price = 0;
        let discount = 0;
        this.discount = 0;
        let defaultPic = this.pic;
        if (!defaultPic || (typeof defaultPic === 'object' && !defaultPic.url) && this.pics) {
            defaultPic = this.pics[0];
        }
        for (let sku of this.skus) {
            let record = skusMap[sku.key];
            if (!record) {
                record = new Sku_1.default();
            }
            if (!utils_1.isIdEqual(sku.goods, this._id)) {
                sku.goods = this._id;
            }
            if (this.shop && !utils_1.isIdEqual(sku.shop, this.shop)) {
                sku.shop = this.shop;
            }
            if (!utils_1.isIdEqual(record, sku)) {
                sku._id = record._id;
            }
            record.set(sku);
            let pic = sku.pic;
            if (!pic || (typeof pic === 'object' && !pic.url)) {
                pic = defaultPic;
                sku.pic = pic;
            }
            record.set('pic', pic);
            record.save({ session: dbSession });
            inventory += sku.inventory;
            volume += sku.volume;
            if (sku.price) {
                if (!price || price > sku.price) {
                    price = sku.price;
                    discount = sku.discount;
                }
            }
        }
        this.inventory = inventory;
        this.volume = volume;
        this.price = price;
        this.discount = discount;
    }
};
