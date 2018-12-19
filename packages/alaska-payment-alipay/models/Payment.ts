import * as _ from 'lodash';
import { Model } from 'alaska-model';

export default function (model: typeof Model) {
  if (_.find(model.fields.type.options, (opt) => opt.value === 'alipay')) return;
  model.fields.type.options.push({ label: 'Alipay', value: 'alipay' });
  model.fields.alipay_trade_no = {
    label: 'Alipay Trade No',
    type: String,
    protected: true
  };
  model.fields.alipay_buyer_email = {
    label: 'Alipay Buyer Email',
    type: String,
    protected: true
  };
  return model;
}
