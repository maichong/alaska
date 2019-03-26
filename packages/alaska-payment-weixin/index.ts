import * as _ from 'lodash';
import * as fs from 'fs';
import * as https from 'https';
import * as stringRandom from 'string-random';
import akita from 'akita';
import { PaymentPlugin, PaymentService } from 'alaska-payment';
import Payment from 'alaska-payment/models/Payment';
import Refund from 'alaska-payment/models/Refund';
import User from 'alaska-user/models/User';
import { md5, sha256, data2xml, xml2data, toQueryString, substr } from './utils';
import { WeixinPaymentOptions, UnifiedOrderReq, UnifiedOrderRes, PayParams, AppPayParams } from '.';

const client = akita.create({});

export default class WeixinPaymentPlugin extends PaymentPlugin {
  configs: Map<string, WeixinPaymentOptions>;

  constructor(service: PaymentService) {
    super(service);
    let config = service.main.config.get('alaska-payment-weixin') || service.error('Missing config [alaska-payment-weixin]');
    if (_.isEmpty(config)) throw new Error('No weixin payment channel found!');
    this.configs = new Map();
    for (let key of _.keys(config)) {
      let options: WeixinPaymentOptions = config[key];
      ['channel', 'appid', 'secret', 'mch_id', 'pay_key', 'notify_url', 'currency'].forEach((k) => {
        // @ts-ignore index
        if (!options[k]) throw new Error(`Missing config [alaska-payment-weixin.${key}.${k}]`);
      });
      if (options.pfx && typeof options.pfx === 'string') {
        options.pfx = fs.readFileSync(options.pfx);
      }
      this.currencies.add(options.currency);
      this.configs.set(`weixin:${key}`, options);
      service.payments.set(`weixin:${key}`, this);
    }
  }

  /**
   * 创建支付参数
   * @param {Payment} payment
   * @param {Object} [data]
   * @returns {PayParams}
   */
  async createParams(payment: Payment): Promise<string> {
    const options = this.configs.get(payment.type);
    if (!options) throw new Error('Unsupported payment type!');
    if (payment.currency && payment.currency !== options.currency) throw new Error('Currency not match!');

    if (payment.amount === 0) {
      return 'success';
    }

    let openid: string = payment.openid;
    if (!openid) {
      let user = await User.findById(payment.user).select('openid');
      if (user) {
        // @ts-ignore
        openid = user.openid;
        if (openid) {
          payment.openid = openid;
        }
      }
    }

    let order = await this.unifiedorder({
      openid,
      body: substr(payment.title, 128),
      out_trade_no: payment.id,
      spbill_create_ip: payment.ip,
      total_fee: _.round(payment.amount * 100),
    }, options);

    return JSON.stringify(this._getPayParamsByPrepay(order, options));
  }

  /**
   * 验证支付回调数据
   */
  async verify(data: any, payment: Payment): Promise<boolean> {
    const options = this.configs.get(payment.type);
    if (!options) return false;
    let sign = this._getSign(data, options);
    return data.sign === sign;
  }

  async refund(refund: Refund, payment: Payment): Promise<void> {
    if (refund.amount === 0) {
      // 退款金额为0，直接成功
      refund.state = 'success';
      return;
    }
    const options = this.configs.get(payment.type);
    if (!options) throw new Error('Unsupported payment type!');
    if (!options.pfx) throw new Error('Weixin refund require pfx!');

    let req = {
      appid: options.appid,
      mch_id: options.mch_id,
      nonce_str: stringRandom(16),
      sign_type: options.sign_type || 'MD5',
      out_trade_no: payment.id,
      out_refund_no: refund.id,
      total_fee: payment.amount * 100 | 0,
      refund_fee: refund.amount * 100 | 0,
      op_user_id: options.mch_id,
      // notify_url: options.notify_url
    };

    // @ts-ignore
    req.sign = this._getSign(req, options);

    let xml = await client.post('https://api.mch.weixin.qq.com/secapi/pay/refund', {
      agent: new https.Agent({
        pfx: options.pfx,
        passphrase: options.mch_id
      }),
      body: data2xml(req)
    }).text();

    let json = await xml2data(xml);
    if (json.return_msg && json.return_msg !== 'OK') {
      throw new Error(json.return_msg);
    }

    refund.weixin_refund_id = json.refund_id;
    refund.state = 'success';
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
  async unifiedorder(data: UnifiedOrderReq, options: WeixinPaymentOptions): Promise<UnifiedOrderRes> {
    _.defaults(data, {
      appid: options.appid,
      mch_id: options.mch_id,
      nonce_str: stringRandom(),
      notify_url: options.notify_url,
      trade_type: this._getTradeType(options.channel),
      spbill_create_ip: data.spbill_create_ip || '127.0.0.1'
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

  _getPayParamsByPrepay(data: UnifiedOrderRes, options: WeixinPaymentOptions): PayParams | AppPayParams {
    if (options.channel === 'app') {
      let req: any = {
        appid: options.appid,
        noncestr: stringRandom(),
        package: 'Sign=WXPay',
        partnerid: options.mch_id,
        prepayid: data.prepay_id,
        timestamp: Date.now() / 1000 | 0
      };
      return {
        appId: options.appid,
        partnerId: options.mch_id,
        prepayId: data.prepay_id,
        package: 'Sign=WXPay',
        nonceStr: req.noncestr,
        timeStamp: req.timestamp,
        sign: this._getSign(req, options)
      }
    }

    let params: PayParams;
    params = {
      appId: data.appid,
      timeStamp: String((Date.now() / 1000 | 0)),
      nonceStr: stringRandom(),
      package: `prepay_id=${data.prepay_id}`,
      signType: options.sign_type || 'MD5'
    };
    params.paySign = this._getSign(params, options);
    delete params.appId;
    if (options.channel === 'jssdk') {
      params.timestamp = params.timeStamp;
    }
    return params;
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
    if (options.sign_type === 'SHA256') {
      return sha256(str, options.pay_key).toUpperCase();
    }
    return md5(str).toUpperCase();
  }
}
