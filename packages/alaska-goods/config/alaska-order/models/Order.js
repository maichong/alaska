'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (Order) {
  Order.fields.type.options.push({ label: 'Goods', value: 'goods' });
};