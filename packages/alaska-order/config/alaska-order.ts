import * as moment from 'moment';
import * as _ from 'lodash';
import Order from '../models/Order';

export default {
  prefix: '',
  services: {
    'alaska-user': {},
    'alaska-balance': {},
    'alaska-settings': {},
    'alaska-payment': {
      optional: true
    }
  },
  codeRandomLength: 6,
  codeCreator: async (order: Order) => {
    while (true) {
      let code = moment(order.createdAt).format('YYMMDD');
      let max = await Order.findOne({ code: new RegExp(`^${code}`) }).sort('-code').select('code');
      let num = max ? parseInt(max.code.substr(6)) : 0;
      num += _.random(1, 20);
      code += _.padStart(num.toString(), Order.service.config.get('codeRandomLength'), '0');
      let old = await Order.findOne({ code }).select('_id');
      if (!old) {
        return code;
      }
    }
  }
};
