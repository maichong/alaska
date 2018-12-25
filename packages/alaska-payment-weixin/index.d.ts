import { PaymentPlugin } from 'alaska-payment';

export interface WeixinPaymentOptions {
  /**
   * 支付渠道
   */
  channel: 'jssdk' | 'app' | 'wxapp' | 'h5';
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
  sign_type?: 'md5' | 'sha256';
}

export interface CallbackData {
  [key: string]: any;
}

export default class WeixinPaymentPlugin extends PaymentPlugin {
}
