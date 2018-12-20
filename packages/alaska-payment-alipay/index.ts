import * as _ from 'lodash';
import * as fs from 'fs';
import * as crypto from 'crypto';
import PAYMENT, { PaymentPlugin } from 'alaska-payment';
import Payment from 'alaska-payment/models/Payment';
import { ObjectMap } from '@samoyed/types';
import { AlipayConfig } from './';

const GATEWAY = 'https://mapi.alipay.com/gateway.do?';

export default class AlipayPlugin extends PaymentPlugin {
  service: typeof PAYMENT;
  label: string;
  _config: AlipayConfig;
  rsa_private_key: Buffer | string;
  rsa_public_key: Buffer | string;

  constructor(service: typeof PAYMENT) {
    super(service);
    this.init(service);
  }

  init(service: typeof PAYMENT) {
    this.service = service;
    if (!service.plugins) {
      service.plugins = {};
    }
    service.plugins.alipay = this;

    this.label = 'Alipay';
    let configTmp: AlipayConfig = service.config.get('alipay');
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
    this.rsa_private_key = fs.readFileSync(rsa_private_key) || '';

    let rsa_public_key = this._config.rsa_public_key || service.panic('rsa_public_key not found');
    this.rsa_public_key = fs.readFileSync(rsa_public_key) || '';
    delete this._config.rsa_public_key;
  }

  /**
   * 创建支付参数
   * @param {Payment} payment
   * @param {Object} [data]
   * @returns {any}
   */
  async createParams(payment: Payment): Promise<string> {
    let params = Object.assign({}, this._config, {
      subject: payment.title,
      out_trade_no: payment._id,
      total_fee: payment.amount
    });
    let link = this.createQueryString(this.paramsFilter(params));

    let signer = crypto.createSign('RSA-SHA1');
    signer.update(link, 'utf8');
    params.sign = signer.sign(this.rsa_private_key.toString(), 'base64');

    return GATEWAY + this.createQueryStringUrlencode(params);
  }

  async verify(data: AlipayConfig) {
    let filtered = this.paramsFilter(data);
    let link = this.createQueryString(filtered);
    let verify = crypto.createVerify('RSA-SHA1');
    verify.update(link, 'utf8');
    return verify.verify(this.rsa_public_key, data.sign, 'base64');
  }

  /**
  * 除去数组中的空值和签名参数
  * @param params 签名参数组
  * @return {object} 去掉空值与签名参数后的新签名参数组
  */
  paramsFilter(params: ObjectMap<any>): Object {
    return _.reduce(params, (result: ObjectMap<any>, value, key) => {
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
  createQueryString(params: ObjectMap<any>): string {
    return Object.keys(params).sort().map((key) => `${key}=${params[key]}`).join('&');
  }

  createQueryStringUrlencode(params: ObjectMap<any>): string {
    return Object.keys(params).sort().map((key) => `${key}=${encodeURIComponent(params[key])}`).join('&');
  }
}
