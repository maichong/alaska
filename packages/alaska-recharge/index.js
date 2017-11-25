'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _alaskaPayment = require('alaska-payment');

var _alaskaPayment2 = _interopRequireDefault(_alaskaPayment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @class RechargeService
 */
class RechargeService extends _alaska.Service {
  constructor(options) {
    options = options || { dir: '', id: '' };
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-recharge';
    super(options);
  }

  postLoadModels() {
    const Recharge = this.getModel('Recharge');
    const Payment = _alaskaPayment2.default.getModel('Payment');
    // $Flow
    Recharge._fields.type.options = Recharge._fields.type.options.concat(Payment.fields.type.options);
  }
}

exports.default = new RechargeService();