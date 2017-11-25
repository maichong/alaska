'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

/**
 * @class PaymentService
 */
class PaymentService extends _alaska.Service {

  constructor(options) {
    options = options || { dir: '', id: '' };
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-payment';
    super(options);
    this.payments = {};
  }
}

exports.default = new PaymentService();