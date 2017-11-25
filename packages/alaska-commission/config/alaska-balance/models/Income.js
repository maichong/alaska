'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (MyIncome) {
  // $Flow
  let options = MyIncome.fields.type.options || [];
  for (let option of options) {
    if (option.value === 'commission') return;
  }
  options.push({
    label: 'Commission',
    value: 'commission'
  });
  MyIncome.fields.type.options = options;
};