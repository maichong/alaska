import * as _ from 'lodash';
import * as stringRandom from 'string-random';
import akita from 'akita';
import { ObjectMap } from 'alaska';
import PAYMENT, { PaymentPlugin } from 'alaska-payment';
import Payment from 'alaska-payment/models/Payment';
import { md5, sha256, data2xml, xml2data, toQueryString } from './utils';
import { CallbackData, WeixinPaymentOptions } from '.';

const client = akita.create({});

export default class WeixinPaymentPlugin extends PaymentPlugin {
  service: typeof PAYMENT;
  config: ObjectMap<WeixinPaymentOptions>;

  constructor(service: typeof PAYMENT) {
    super(service);
    let config = service.main.config.get('alaska-payment-weixin') || service.error('Missing config [alaska-payment-weixin]');
    if (_.isEmpty(config)) throw new Error('no weixin payment channel found');
    this.config = config;
    for (let key of _.keys(config)) {
      let options: WeixinPaymentOptions = config[key];
      ['channel', 'appid', 'secret', 'mch_id', 'pay_key', 'notify_url'].forEach((k) => {
        // @ts-ignore index
        if (!options[k]) throw new Error(`Missing config [alaska-payment-weixin.${key}.${k}]`);
      });
    }
  }

  /**
   * 创建支付参数
   * @param {Payment} payment
   * @param {Object} [data]
   * @returns {any}
   */
  async createParams(payment: Payment): Promise<any> {
    // FIXME:
  }

  /**
   * 验证支付回调数据
   */
  async verify(data: CallbackData) {
    // FIXME:
  }

  /**
   * 查询订单
   * @param orderId
   */
  async orderquery(orderId: string, options: WeixinPaymentOptions): Promise<any> {
    let data: any = {
      appid: options.appid,
      mch_id: options.mch_id,
      nonce_str: stringRandom(),
      out_trade_no: orderId
    };
    data.sign = this._getSign(data, options);

    let xml = data2xml(data);

    let result = await client.post('https://api.mch.weixin.qq.com/pay/orderquery', {
      body: xml
    }).text();

    return await xml2data(result);
  }

  /**
   * 统一下单
   * @param data
   */
  async unifiedorder(data: any, options: WeixinPaymentOptions): Promise<any> {
    _.defaults(data, {
      appid: options.appid,
      mch_id: options.mch_id,
      nonce_str: stringRandom(),
      notify_url: options.notify_url,
      trade_type: this._getTradeType(options.channel)
    });

    data.sign = this._getSign(data, options);

    let xml = data2xml(data);

    let result = await client.post('https://api.mch.weixin.qq.com/pay/unifiedorder', {
      body: xml
    }).text();

    let json = await xml2data(result);
    if (json.return_msg && json.return_msg !== 'OK') {
      throw new Error(json.return_msg);
    }

    return json;
  }

  _getTradeType(channel: string): string {
    switch (channel) {
      case 'jssdk':
      case 'wxapp':
        return 'JSAPI';
      case 'app':
        return 'APP';
      case 'native':
        return 'NATIVE';
      case 'h5':
        return 'MWEB';
      default:
        throw new Error(`Unsupported payment channel ${channel}`);
    }
  }

  _getSign(data: any, options: WeixinPaymentOptions) {
    let str = `${toQueryString(data)}&key=${options.pay_key}`;
    if (options.sign_type === 'sha256') {
      return sha256(str, options.pay_key).toUpperCase();
    }
    return md5(str).toUpperCase();
  }
}
