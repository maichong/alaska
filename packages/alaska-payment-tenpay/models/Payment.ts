import * as _ from 'lodash';
import { Model } from 'alaska-model';

export default function (model: typeof Model) {
  if (_.find(model.fields.type.options, (opt) => opt.value === 'tenpay')) return;
  model.fields.type.options.push({ label: 'Tenpay', value: 'tenpay' });
  model.fields.tenpay_transaction_id = {
    label: 'Tenpay Trade No',
    type: String,
    protected: true
  };
  model.fields.openid = {
    label: 'User Openid',
    type: String,
    protected: true
  };
  model.fields.tradeType = {
    label: 'Trade Type',
    type: String,
    protected: true
  };
  return model;
}
