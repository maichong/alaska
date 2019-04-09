import * as _ from 'lodash';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as moment from 'moment';
import akita from 'akita';
import { PaymentService, PaymentPlugin } from 'alaska-payment';
import Payment from 'alaska-payment/models/Payment';
import Refund from 'alaska-payment/models/Refund';
import { ObjectMap } from 'alaska';
import { substr } from './utils';
import { AlipayPaymentOptions, CallbackData } from '.';

const client = akita.create({});
const GATEWAY = 'https://openapi.alipay.com/gateway.do';

export default class AlipayPaymentPlugin extends PaymentPlugin {
  service: PaymentService;
  configs: Map<string, AlipayPaymentOptions>;

  constructor(service: PaymentService) {
    super(service);
    let config = service.main.config.get('alaska-payment-alipay') || service.error('Missing config [alaska-payment-alipay]');

    this.configs = new Map();
    for (let key of _.keys(config)) {
      let options: AlipayPaymentOptions = config[key];
      ['channel', 'app_id', 'private_key', 'alipay_public_key', 'notify_url'].forEach((k) => {
        // @ts-ignore index
        if (!options[k]) throw new Error(`Missing config [alaska-payment-alipay.${key}.${k}]`);
      });
      if (typeof options.private_key === 'string') {
        options.private_key = fs.readFileSync(options.private_key);
      }
      if (typeof options.alipay_public_key === 'string') {
        options.alipay_public_key = fs.readFileSync(options.alipay_public_key);
      }
      this.configs.set(`alipay:${key}`, options);
      service.payments.set(`alipay:${key}`, this);
    }
  }

  /**
   * 创建支付参数
   * @param {Payment} payment
   * @param {Object} [data]
   * @returns {any}
   */
  async createParams(payment: Payment): Promise<string> {
    const options = this.configs.get(payment.type);
    if (!options) throw new Error('Unsupported payment type!');
    if (payment.currency && options.currency && payment.currency !== options.currency) throw new Error('Currency not match!');

    if (payment.amount === 0) {
      return 'success';
    }

    let params: any = {
      app_id: options.app_id,
      method: '',
      charset: 'utf-8',
      sign_type: options.sign_type || 'RSA2',
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
      version: '1.0',
      notify_url: options.notify_url,
      biz_content: {
        subject: substr(payment.title, 256),
        out_trade_no: payment.id,
        total_amount: payment.amount,
        product_code: ''
      }
    }

    switch (options.channel) {
      case 'app':
        params.method = 'alipay.trade.app.pay';
        params.biz_content.product_code = 'QUICK_MSECURITY_PAY';
        break;
      case 'web':
        params.method = 'alipay.trade.page.pay';
        if (options.return_url) {
          params.return_url = options.return_url;
        }
        params.biz_content.product_code = 'FAST_INSTANT_TRADE_PAY';
        params.biz_content.qr_pay_mode = '2';
        break;
      default:
        throw new Error('Unsupported alipay channel');
    }

    params.biz_content = _.assign(params.biz_content, options.biz_content, payment.alipay_biz_content);

    let link = this.createQueryString(this.paramsFilter(params));

    let signer = crypto.createSign(options.sign_type === 'RSA' ? 'RSA-SHA1' : 'RSA-SHA256');
    signer.update(link, 'utf8');
    params.sign = signer.sign(options.private_key, 'base64');

    let payParams = this.createQueryStringUrlencode(params);

    if (options.channel === 'app') {
      // app
      return payParams;
    }
    // web
    return GATEWAY + '?' + payParams
  }

  async verify(data: CallbackData, payment: Payment): Promise<boolean> {
    const options = this.configs.get(payment.type);
    if (!options) return false;
    let filtered = this.paramsFilter(data);
    delete filtered.sign_type;
    let link = this.createQueryString(filtered);
    let verify = crypto.createVerify(options.sign_type === 'RSA' ? 'RSA-SHA1' : 'RSA-SHA256');
    verify.update(link, 'utf8');
    return verify.verify(options.alipay_public_key, data.sign, 'base64');
  }


  async refund(refund: Refund, payment: Payment): Promise<void> {
    if (refund.amount === 0) {
      // 退款金额为0，直接成功
      refund.state = 'success';
      return;
    }
    const options = this.configs.get(payment.type);
    if (!options) throw new Error('Unsupported payment type!');

    let params: any = {
      app_id: options.app_id,
      method: 'alipay.trade.refund',
      charset: 'utf-8',
      sign_type: options.sign_type || 'RSA2',
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
      version: '1.0',
      notify_url: options.notify_url,
      biz_content: _.assign({
        out_trade_no: payment.id,
        refund_amount: refund.amount,
        out_request_no: refund.id,
      }, options.biz_content, refund.alipay_biz_content)
    }

    let link = this.createQueryString(this.paramsFilter(params));

    let signer = crypto.createSign(options.sign_type === 'RSA' ? 'RSA-SHA1' : 'RSA-SHA256');
    signer.update(link, 'utf8');
    params.sign = signer.sign(options.private_key, 'base64');

    let { alipay_trade_refund_response: res } = await client.post(GATEWAY, {
      body: params
    });

    if (res.msg === 'Success') {
      refund.alipay_trade_no = res.trade_no;
      refund.state = 'success';
    } else {
      refund.state = 'failed';
      refund.failure = res.sub_code;
    }
  }

  /**
  * 除去数组中的空值和签名参数
  * @param params 签名参数组
  * @return {object} 去掉空值与签名参数后的新签名参数组
  */
  private paramsFilter(params: ObjectMap<any>): ObjectMap<any> {
    return _.reduce(params, (result: ObjectMap<any>, value, key) => {
      if (value && key !== 'sign') {
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
  private createQueryString(params: ObjectMap<any>): string {
    return _.keys(params).sort().map((key) => {
      let value = params[key];
      if (_.isPlainObject(value)) {
        value = JSON.stringify(value);
      }
      return `${key}=${value}`;
    }).join('&');
  }

  private createQueryStringUrlencode(params: ObjectMap<any>): string {
    return _.keys(params).sort().map((key) => {
      let value = params[key];
      if (_.isPlainObject(value)) {
        value = JSON.stringify(value);
      }
      return `${key}=${encodeURIComponent(value)}`
    }).join('&');
  }
}
