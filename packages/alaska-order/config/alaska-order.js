'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  prefix: '/order',
  services: {
    'alaska-user': {},
    'alaska-balance': {},
    'alaska-settings': {},
    'alaska-payment': {
      optional: true
    }
  },
  status: [{
    label: 'Order_New',
    value: 200
  }, {
    label: 'Order_Payed',
    value: 300
  }, {
    label: 'Order_Confirmed',
    value: 400
  }, {
    label: 'Order_Shipped',
    value: 500
  }, {
    label: 'Order_Done',
    value: 600
  }, {
    label: 'Order_Refund',
    value: 800
  }, {
    label: 'Order_Failed',
    value: 900
  }]
};