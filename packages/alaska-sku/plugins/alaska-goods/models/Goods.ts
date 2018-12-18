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
    let skus = await Sku.find({ goods: this._id });
    let skusMap = _.keyBy(skus, 'key');
    for (let sku of this.skus) {
      let record = skusMap[sku.key];
      if (!record) {
        record = new Sku();
      }
      if (!isIdEqual(record, sku)) {
        sku._id = record._id;
      }
      record.set(sku);
      await record.save();
    }
  }
}
