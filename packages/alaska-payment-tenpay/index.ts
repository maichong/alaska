import * as _ from 'lodash';
import * as fs from 'fs';
import * as random from 'string-random';
import { NormalError } from 'alaska';
import PAYMENT, { PaymentPlugin } from 'alaska-payment';
import * as urllib from 'urllib';
import { ObjectMap } from '@samoyed/types';
import { TenpayConfig, PaymentTenpay } from './';
import * as utils from './utils/utils';

const GATEWAY: ObjectMap<string> = {
  micropay: 'https://api.mch.weixin.qq.com/pay/micropay',
  reverse: 'https://api.mch.weixin.qq.com/secapi/pay/reverse',
  unifiedorder: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
  orderquery: 'https://api.mch.weixin.qq.com/pay/orderquery',
  closeorder: 'https://api.mch.weixin.qq.com/pay/closeorder',
  refund: 'https://api.mch.weixin.qq.com/secapi/pay/refund',
  refundquery: 'https://api.mch.weixin.qq.com/pay/refundquery',
  downloadbill: 'https://api.mch.weixin.qq.com/pay/downloadbill',
  downloadfundflow: 'https://api.mch.weixin.qq.com/pay/downloadfundflow',
  send_coupon: 'https://api.mch.weixin.qq.com/mmpaymkttransfers/send_coupon',
  query_coupon_stock: 'https://api.mch.weixin.qq.com/mmpaymkttransfers/query_coupon_stock',
  querycouponsinfo: 'https://api.mch.weixin.qq.com/mmpaymkttransfers/querycouponsinfo',
  transfers: 'https://api.mch.weixin.qq.com/mmpaymkttransfers/promotion/transfers',
  gettransferinfo: 'https://api.mch.weixin.qq.com/mmpaymkttransfers/gettransferinfo',
  sendredpack: 'https://api.mch.weixin.qq.com/mmpaymkttransfers/sendredpack',
  sendgroupredpack: 'https://api.mch.weixin.qq.com/mmpaymkttransfers/sendgroupredpack',
  gethbinfo: 'https://api.mch.weixin.qq.com/mmpaymkttransfers/gethbinfo',
  paybank: 'https://api.mch.weixin.qq.com/mmpaysptrans/pay_bank',
  querybank: 'https://api.mch.weixin.qq.com/mmpaysptrans/query_bank',
  getpublickey: 'https://fraud.mch.weixin.qq.com/risk/getpublickey',
  getsignkey: 'https://api.mch.weixin.qq.com/sandboxnew/pay/getsignkey'
};

export default class TenpayPlugin extends PaymentPlugin {
  service: typeof PAYMENT;
  label: string;
  _config: TenpayConfig;

  constructor(service: typeof PAYMENT) {
    super(service);
    this.init(service);
  }

  init(service: typeof PAYMENT) {
    this.service = service;
    if (!service.plugins) {
      service.plugins = {};
    }
    service.plugins.tenpay = this;

    this.label = 'Tenpay';
    let configTmp: TenpayConfig = service.config.get('tenpay');
    if (!configTmp) {
      throw new Error('Tenpay config not found');
    }

    this._config = configTmp;
    this._config = Object.assign({
      appid: '',
      mch_id: '',
      partnerKey: '',
      pfx: '',
      notify_url: '',
      refund_url: '',
      spbill_create_ip: '127.0.0.1'
    }, this._config);
    let pfxPath = this._config.pfx;
    if (pfxPath) {
      let pfx = fs.readFileSync(pfxPath) || '';
      this._config = Object.assign(this._config, { pfx });
    }
  }

  /**
   * 将响应转为json
   * @param {string} xml
   * @param {string} type
   */
  async _parse(xml: string, type: string) {
    let json: ObjectMap<any> = await utils.parseXML(xml);
    switch (type) {
      case 'middleware_nativePay':
        break;
      default:
        if (json.return_code !== 'SUCCESS') throw new NormalError(json.return_msg || 'XMLDataError');
    }
    switch (type) {
      case 'middleware_refund':
      case 'middleware_nativePay':
      case 'getsignkey':
        break;
      default:
        if (json.result_code !== 'SUCCESS') throw new NormalError(json.err_code || 'XMLDataError');
    }
    switch (type) {
      case 'getsignkey':
        break;
      case 'middleware_refund':
        if (json.appid !== this._config.appid) throw new NormalError('appid不匹配');
        if (json.mch_id !== this._config.mch_id) throw new NormalError('mch_id不匹配');
        json.req_info = await utils.parseXML(
          utils.decrypt(
            json.req_info,
            utils.md5(this._config.partnerKey).toLowerCase()
          )
        );
        break;
      case 'transfers':
        if (json.mchid !== this._config.mch_id) throw new NormalError('mchid不匹配');
        break;
      case 'sendredpack':
      case 'sendgroupredpack':
        if (json.wxappid !== this._config.appid) throw new NormalError('wxappid不匹配');
        if (json.mch_id !== this._config.mch_id) throw new NormalError('mchid不匹配');
        break;
      case 'gethbinfo':
      case 'gettransferinfo':
        if (json.mch_id !== this._config.mch_id) throw new NormalError('mchid不匹配');
        break;
      case 'send_coupon':
      case 'query_coupon_stock':
      case 'querycouponsinfo':
        if (json.appid !== this._config.appid) throw new NormalError('appid不匹配');
        if (json.mch_id !== this._config.mch_id) throw new NormalError('mch_id不匹配');
        break;
      case 'getpublickey':
        break;
      case 'paybank':
        if (json.mch_id !== this._config.mch_id) throw new NormalError('mchid不匹配');
        break;
      case 'querybank':
        if (json.mch_id !== this._config.mch_id) throw new NormalError('mchid不匹配');
        break;
      default:
        if (json.appid !== this._config.appid) throw new NormalError('appid不匹配');
        if (json.mch_id !== this._config.mch_id) throw new NormalError('mch_id不匹配');
        if (json.sign !== this._getSign(json, json.sign_type)) throw new NormalError('sign签名错误');
    }
    return json;
  }

  async _parseBill(xml: string, format: boolean = false) {
    if (utils.checkXML(xml)) {
      let json = await utils.parseXML(xml);
      throw new Error(json.err_code || json.return_msg || 'XMLDataError');
    }
    if (!format) return xml;

    let arr = xml.trim().split(/\r?\n/).filter(item => item.trim());
    let total_data = arr.pop().substr(1).split(',`');
    let total_title = arr.pop().split(',');
    let list_title = arr.shift().split(',');
    let list_data = arr.map(item => item.substr(1).split(',`'));
    return { total_title, total_data, list_title, list_data };
  }

  verify(params: ObjectMap<any>) {
    let sign = this._getSign(params);
    return params.sign === sign;
  }

  /**
   * 获取支付签名
   * @param params 支付参数
   * @param type 签名类型 default='MD5'
   */
  _getSign(params: ObjectMap<any>, type: string = 'MD5') {
    let str = `${utils.toQueryString(params)}&key=${this._config.partnerKey}`;
    if (type === 'MD5') {
      return utils.md5(str).toUpperCase();
    }
    if (type === 'SHA256') {
      return utils.sha256(str, this._config.partnerKey).toUpperCase();
    }
    throw new Error('SignType Error');
  }

  /**
   * 请求微信接口
   * @param {ObjectMap<any>} params 请求参数
   * @param {string} type 请求接口类型
   * @param {boolean} cert 是否需要ca证书
   */
  async _request(params: ObjectMap<any>, type: string, cert: boolean = false) {
    params.sign = this._getSign(params, params.sign_type);

    let pkg: ObjectMap<any> = { method: 'POST', dataType: 'text', data: utils.buildXML(params) };
    if (cert) {
      pkg.pfx = this._config.pfx;
      pkg.passphrase = this._config.mch_id;
    }

    let { status, data } = await urllib.request(GATEWAY[type], pkg);
    if (status !== 200) throw new Error('request fail');

    return ['downloadbill', 'downloadfundflow'].indexOf(type) < 0 ? this._parse(data, type) : data;
  }

  getPublicKey(params: ObjectMap<any>) {
    let pkg = {
      mch_id: this._config.mch_id,
      nonce_str: random(16),
      sign_type: params.sign_type || 'MD5'
    };
    return this._request(pkg, 'getpublickey', true);
  }

  /**
   * 统一下单
   * @param {ObjectMap<any>} params 参数
   */
  unifiedOrder(params: ObjectMap<any>) {
    let pkg = Object.assign({}, params, {
      appid: this._config.appid,
      mch_id: this._config.mch_id,
      nonce_str: random(16),
      sign_type: params.sign_type || 'MD5',
      notify_url: params.notify_url || this._config.notify_url,
      spbill_create_ip: params.spbill_create_ip || this._config.spbill_create_ip,
      trade_type: params.trade_type || 'JSAPI'
    });
    return this._request(pkg, 'unifiedorder');
  }

  async getPayParams(params: ObjectMap<any>) {
    params.trade_type = params.trade_type || 'JSAPI';
    let order = await this.unifiedOrder(params);
    return this.getPayParamsByPrepay(order);
  }
  getPayParamsByPrepay(params: ObjectMap<any>) {
    let pkg: ObjectMap<any> = {
      appId: params.sub_appid || this._config.appid,
      timeStamp: String((Date.now() / 1000 | 0)),
      nonceStr: random(16),
      package: `prepay_id=${params.prepay_id}`,
      signType: params.signType || 'MD5'
    };
    pkg.paySign = this._getSign(pkg, pkg.signType);
    pkg.timestamp = pkg.timeStamp;
    return pkg;
  }

  // 获取APP支付参数(自动下单)
  async getAppParams(params: ObjectMap<any>) {
    params.trade_type = params.trade_type || 'APP';
    let order = await this.unifiedOrder(params);
    return this.getAppParamsByPrepay(order, params.sign_type);
  }

  // 获取APP支付参数(通过预支付会话标志)
  getAppParamsByPrepay(params: ObjectMap<any>, signType: string) {
    let pkg: ObjectMap<any> = {
      appid: this._config.appid,
      partnerid: this._config.mch_id,
      prepayid: params.prepay_id,
      package: 'Sign=WXPay',
      noncestr: random(16),
      timestamp: String((Date.now() / 1000 | 0))
    };
    pkg.sign = this._getSign(pkg, signType);
    return pkg;
  }

  /**
   * 获取JSAPI支付参数
   * @param {Payment} payment
   * @param {Object} [data]
   * @returns {any}
   */
  async createParams(payment: PaymentTenpay): Promise<ObjectMap<any>> {
    let trade_type = this._config.trade_type || 'JSAPI';
    let params = Object.assign({}, {
      trade_type,
      body: payment.title,
      out_trade_no: payment._id,
      total_fee: payment.amount * 100,
      openid: payment.openid
    }, this._config);
    return this.getPayParams(params);
  }

  // 扫码支付, 生成URL(模式一)
  getNativeUrl(params: ObjectMap<any>) {
    let pkg: ObjectMap<any> = {
      ...params,
      appid: this._config.appid,
      mch_id: this._config.mch_id,
      time_stamp: String((Date.now() / 1000 | 0)),
      nonce_str: random(16)
    };

    let url = `${'weixin://wxpay/bizpayurl'
      + '?sign='}${this._getSign(pkg)
    }&appid=${pkg.appid
    }&mch_id=${pkg.mch_id
    }&product_id=${encodeURIComponent(pkg.product_id)
    }&time_stamp=${pkg.time_stamp
    }&nonce_str=${pkg.nonce_str}`;
    return url;
  }

  // 拼装扫码模式一返回值
  _getNativeReply(prepay_id: string, err_code_des: string) {
    let pkg: ObjectMap<any> = {
      return_code: 'SUCCESS',
      appid: this._config.appid,
      mch_id: this._config.mch_id,
      nonce_str: random(16),
      result_code: 'SUCCESS',
      prepay_id
    };

    if (err_code_des) {
      pkg.result_code = 'FAIL';
      pkg.err_code_des = err_code_des;
    }

    pkg.sign = this._getSign(pkg);
    return utils.buildXML(pkg);
  }

  // 刷卡支付
  micropay(params: ObjectMap<any>) {
    let pkg = {
      ...params,
      appid: this._config.appid,
      mch_id: this._config.mch_id,
      nonce_str: random(16),
      sign_type: params.sign_type || 'MD5',
      spbill_create_ip: params.spbill_create_ip || this._config.spbill_create_ip
    };

    return this._request(pkg, 'micropay');
  }

  // 撤销订单
  reverse(params: ObjectMap<any>) {
    let pkg = {
      ...params,
      appid: this._config.appid,
      mch_id: this._config.mch_id,
      nonce_str: random(16),
      sign_type: params.sign_type || 'MD5'
    };

    return this._request(pkg, 'reverse', true);
  }

  // 订单查询
  orderQuery(params: ObjectMap<any>) {
    let pkg = {
      ...params,
      appid: this._config.appid,
      mch_id: this._config.mch_id,
      nonce_str: random(16),
      sign_type: params.sign_type || 'MD5'
    };

    return this._request(pkg, 'orderquery');
  }

  // 关闭订单
  closeOrder(params: ObjectMap<any>) {
    let pkg = {
      ...params,
      appid: this._config.appid,
      mch_id: this._config.mch_id,
      nonce_str: random(16),
      sign_type: params.sign_type || 'MD5'
    };

    return this._request(pkg, 'closeorder');
  }

  // 申请退款
  refund(params: ObjectMap<any>) {
    let pkg = {
      ...params,
      appid: this._config.appid,
      mch_id: this._config.mch_id,
      nonce_str: random(16),
      sign_type: params.sign_type || 'MD5',
      op_user_id: params.op_user_id || this._config.mch_id,
      notify_url: params.notify_url || this._config.refund_url
    };
    if (!pkg.notify_url) delete pkg.notify_url;

    return this._request(pkg, 'refund', true);
  }

  // 查询退款
  refundQuery(params: ObjectMap<any>) {
    let pkg = {
      ...params,
      appid: this._config.appid,
      mch_id: this._config.mch_id,
      nonce_str: random(16),
      sign_type: params.sign_type || 'MD5'
    };

    return this._request(pkg, 'refundquery');
  }

  // 下载对帐单
  async downloadBill(params: ObjectMap<any>, format: boolean = false) {
    let pkg = {
      ...params,
      appid: this._config.appid,
      mch_id: this._config.mch_id,
      nonce_str: random(16),
      sign_type: params.sign_type || 'MD5',
      bill_type: params.bill_type || 'ALL'
    };

    let xml = await this._request(pkg, 'downloadbill');
    return this._parseBill(xml, format);
  }

  // 下载资金帐单
  async downloadFundflow(params: ObjectMap<any>, format: boolean = false) {
    let pkg = {
      ...params,
      appid: this._config.appid,
      mch_id: this._config.mch_id,
      nonce_str: random(16),
      sign_type: params.sign_type || 'HMAC-SHA256',
      account_type: params.account_type || 'Basic'
    };

    let xml = await this._request(pkg, 'downloadfundflow', true);
    return this._parseBill(xml, format);
  }

  // 发放代金券
  sendCoupon(params: ObjectMap<any>) {
    let pkg = {
      ...params,
      appid: this._config.appid,
      mch_id: this._config.mch_id,
      nonce_str: random(16),
      openid_count: params.openid_count || 1
    };

    return this._request(pkg, 'send_coupon', true);
  }

  // 查询代金券批次
  queryCouponStock(params: ObjectMap<any>) {
    let pkg = {
      ...params,
      appid: this._config.appid,
      mch_id: this._config.mch_id,
      nonce_str: random(16)
    };

    return this._request(pkg, 'query_coupon_stock');
  }

  // 查询代金券信息
  queryCouponInfo(params: ObjectMap<any>) {
    let pkg = {
      ...params,
      appid: this._config.appid,
      mch_id: this._config.mch_id,
      nonce_str: random(16)
    };

    return this._request(pkg, 'querycouponsinfo');
  }

  // 企业付款
  transfers(params: ObjectMap<any>) {
    let pkg = {
      ...params,
      mch_appid: this._config.appid,
      mchid: this._config.mch_id,
      nonce_str: random(16),
      check_name: params.check_name || 'FORCE_CHECK',
      spbill_create_ip: params.spbill_create_ip || this._config.spbill_create_ip
    };

    return this._request(pkg, 'transfers', true);
  }

  // 查询企业付款
  transfersQuery(params: ObjectMap<any>) {
    let pkg = {
      ...params,
      appid: this._config.appid,
      mch_id: this._config.mch_id,
      nonce_str: random(16)
    };

    return this._request(pkg, 'gettransferinfo', true);
  }

  // 企业付款到银行卡
  async payBank(params: ObjectMap<any>) {
    const data = await this.getPublicKey(params);
    const pub_key = data && data.result_code === 'SUCCESS' ? data.pub_key : '';
    if (pub_key === '') throw new Error('get publickey fail');

    let pkg = {
      ...params,
      mch_id: this._config.mch_id,
      nonce_str: random(16),
      enc_bank_no: utils.encryptRSA(pub_key, params.enc_bank_no),
      enc_true_name: utils.encryptRSA(pub_key, params.enc_true_name)
    };

    return this._request(pkg, 'paybank', true);
  }

  // 查询企业付款到银行卡
  queryBank(params: ObjectMap<any>) {
    let pkg = {
      ...params,
      mch_id: this._config.mch_id,
      nonce_str: random(16)
    };

    return this._request(pkg, 'querybank', true);
  }

  // 发送普通红包
  sendRedpack(params: ObjectMap<any>) {
    let pkg: ObjectMap<any> = {
      ...params,
      wxappid: this._config.appid,
      mch_id: this._config.mch_id,
      nonce_str: random(16),
      client_ip: params.client_ip || this._config.spbill_create_ip,
      mch_billno: params.mch_billno || (params.mch_autono ? this._config.mch_id + utils.getFullDate() + params.mch_autono : ''),
      total_num: params.total_num || 1
    };
    delete pkg.mch_autono;

    return this._request(pkg, 'sendredpack', true);
  }

  // 发送裂变红包
  sendGroupRedpack(params: ObjectMap<any>) {
    let pkg: ObjectMap<any> = {
      ...params,
      wxappid: this._config.appid,
      mch_id: this._config.mch_id,
      nonce_str: random(16),
      mch_billno: params.mch_billno || (params.mch_autono ? this._config.mch_id + utils.getFullDate() + params.mch_autono : ''),
      total_num: params.total_num || 3,
      amt_type: params.amt_type || 'ALL_RAND'
    };
    delete pkg.mch_autono;

    return this._request(pkg, 'sendgroupredpack', true);
  }

  // 查询红包记录
  redpackQuery(params: ObjectMap<any>) {
    let pkg = {
      ...params,
      appid: this._config.appid,
      mch_id: this._config.mch_id,
      nonce_str: random(16),
      bill_type: params.bill_type || 'MCHT'
    };

    return this._request(pkg, 'gethbinfo', true);
  }
}
