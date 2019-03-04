import * as _ from 'lodash';
import { isIdEqual } from 'alaska-model/utils';
import Sku from '../../../models/Sku';

export default {
  groups: {
    sku: {
      title: 'SKU',
      panel: false,
      after: 'props'
    }
  },
  fields: {
    skus: {
      type: Sku,
      multi: true,
      view: 'SkuEditor',
      group: 'sku'
    },
  },
  async preSave() {
    if (!_.size(this.skus)) return;
    let dbSession = this.$session();
    let skus = await Sku.find({ goods: this._id }).session(dbSession);
    let skusMap = _.keyBy(skus, 'key');
    let inventory = 0;
    let volume = 0;
    let price = 0;
    let discount = 0;
    this.discount = 0;
    for (let sku of this.skus) {
      let record = skusMap[sku.key];
      if (!record) {
        record = new Sku();
      }
      record.set(sku);
      if (!isIdEqual(record, sku)) {
        sku._id = record._id;
      }
      if (!isIdEqual(this._id, sku.goods)) {
        sku.goods = this._id;
      }
      if (this.shop && !isIdEqual(this.shop, sku.shop)) {
        sku.shop = this.shop;
      }
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
