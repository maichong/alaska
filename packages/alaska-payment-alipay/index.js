'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _Payment = require('alaska-payment/models/Payment');

var _Payment2 = _interopRequireDefault(_Payment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint camelcase:0 */

const GATEWAY = 'https://mapi.alipay.com/gateway.do?';

class AlipayPlugin {

  constructor(service) {
    this.init(service);
  }

  init(service) {
    this.service = service;
    service.payments.alipay = this;
    // TODO
    service.addConfigDir(__dirname);
    this.label = 'Alipay';
    let configTmp = service.getConfig('alipay');

    if (!configTmp) {
      service.panic('Alipay config not found');
    }

    this._config = configTmp;
    this._config = Object.assign({
      partner: '',
      seller_id: '',
      notify_url: '',
      return_url: '',
      service: 'create_direct_pay_by_user',
      payment_type: '1',
      _input_charset: 'utf-8',
      it_b_pay: '1d',
      sign_type: 'RSA'
    }, this._config);
    let rsa_private_key = this._config.rsa_private_key || service.panic('rsa_private_key not found');
    delete this._config.rsa_private_key;
    // $Flow 确认readFileSync读出数据是string
    this.rsa_private_key = _fs2.default.readFileSync(rsa_private_key) || '';
    let rsa_public_key = this._config.rsa_public_key || service.panic('rsa_public_key not found');
    // $Flow 确认readFileSync读出数据是string
    this.rsa_public_key = _fs2.default.readFileSync(rsa_public_key) || '';
    delete this._config.rsa_public_key;
  }

  /**
   * 创建支付参数
   * @param {Payment} payment
   * @param {Object} [data]
   * @returns {any}
   */
  async createParams(payment, data) {
    let params = Object.assign({}, this._config, {
      subject: payment.title,
      out_trade_no: payment.id,
      total_fee: payment.amount
    }, data);
    let link = this.createQueryString(this.paramsFilter(params));

    let signer = _crypto2.default.createSign('RSA-SHA1');
    signer.update(link, 'utf8');
    params.sign = signer.sign(this.rsa_private_key, 'base64');

    return GATEWAY + this.createQueryStringUrlencode(params);
  }

  async verify(data) {
    let filtered = this.paramsFilter(data);
    let link = this.createQueryString(filtered);
    let verify = _crypto2.default.createVerify('RSA-SHA1');
    verify.update(link, 'utf8');
    return verify.verify(this.rsa_public_key, data.sign, 'base64');
  }

  /**
   * 除去数组中的空值和签名参数
   * @param params 签名参数组
   * @return {object} 去掉空值与签名参数后的新签名参数组
   */
  paramsFilter(params) {
    return _lodash2.default.reduce(params, (result, value, key) => {
      if (value && key !== 'sign' && key !== 'sign_type') {
        result[key] = value;
      }
      return result;
    }, {});
  }

  /**
   * 把数组所有元素，按照“参数=参数值”的模式用“&”字符拼接成字符串
   * @param params
   * @returns {string}
   */
  createQueryString(params) {
    return Object.keys(params).sort().map(key => key + '=' + params[key]).join('&');
  }

  createQueryStringUrlencode(params) {
    return Object.keys(params).sort().map(key => key + '=' + encodeURIComponent(params[key])).join('&');
  }
}
exports.default = AlipayPlugin;