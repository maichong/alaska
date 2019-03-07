import { PaymentPlugin } from 'alaska-payment';

declare module 'alaska-payment/models/Payment' {
  export interface PaymentFields {
    openid: string;
    weixin_transaction_id: string;
  }
}

declare module 'alaska-payment/models/Refund' {
  export interface RefundFields {
    weixin_refund_id: string;
  }
}

export interface WeixinPaymentOptions {
  /**
   * 支付渠道
   */
  channel: 'jssdk' | 'app' | 'wxapp' | 'h5';
  /**
   * 当前支付类型支持的货币
   */
  currency: string;
  /**
   * APP ID
   */
  appid: string;
  /**
   * 秘钥
   */
  secret: string;
  /**
   * 微信支付商户ID
   */
  mch_id: string;
  /**
   * 支付秘钥
   */
  pay_key: string;
  /**
   * 支付通知地址
   */
  notify_url: string;
  /**
   * 签名方式
   */
  sign_type?: 'MD5' | 'SHA256';
  /**
   * pfx 证书路径或内容
   */
  pfx?: string | Buffer;
}

export interface UnifiedOrderReq {
  device_info?: string;
  body: string;
  detail?: string;
  attach?: string;
  out_trade_no: string;
  fee_type?: string;
  total_fee: number;
  spbill_create_ip?: string;
  time_start?: string;
  time_expire?: string;
  goods_tag?: string;
  product_id?: string;
  limit_pay?: string;
  openid?: string;
  receipt?: string;
  scene_info?: {
    id: string;
    name: string;
    area_code: string;
    address: string;
  };

  // 以下不需要传
  sign?: string;
}

export interface UnifiedOrderRes {
  return_code: 'SUCCESS';
  return_msg: 'OK';
  appid: string;
  mch_id: string;
  nonce_str: string;
  sign: string;
  result_code: string;
  prepay_id: string;
  trade_type: string;
}

export interface PayParams {
  appId?: string;
  timeStamp: string;
  nonceStr: string;
  package: string;
  signType: string;
  paySign?: string;
}

export default class WeixinPaymentPlugin extends PaymentPlugin {
}
