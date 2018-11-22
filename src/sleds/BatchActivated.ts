import * as _ from 'lodash';
import { Sled } from 'alaska-sled';
import Order from '../models/Order';

export default class BatchActivated extends Sled<{}, void> {
  async exec(params: any) {
    const { model, records } = params;
    let { modelName } = model;
    if (records && records.length) {
      const recordIds = _.map(records, (item) => item._id);
      let list: Order[] = [];
      if (modelName === 'Order') {
        list = await Order.find().where('_id').in(recordIds);
      }
      _.map(list, (item) => {
        if (!item.activated) {
          item.activated = true;
          item.save();
        }
      });
    }
  }
}
