// @flow

import type Income from 'alaska-balance/models/Income';

export default function (MyIncome: Class<Income>) {
  // $Flow
  let options: Object[] = MyIncome.fields.type.options || [];
  for (let option of options) {
    if (option.value === 'commission') return;
  }
  options.push({
    label: 'Commission',
    value: 'commission'
  });
  MyIncome.fields.type.options = options;
}
