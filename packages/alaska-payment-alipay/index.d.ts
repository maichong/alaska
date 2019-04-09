import { PluginConfig } from 'alaska';
import { PaymentPlugin } from 'alaska-payment';

declare module 'alaska-payment/models/Payment' {
  export interface PaymentFields {
    alipay_biz_content: any;
    alipay_trade_no: string;
    alipay_buyer_id: string;
    alipay_buyer_logon_id: string;
  }
}

declare module 'alaska-payment/models/Refund' {
  export interface RefundFields {
    alipay_biz_content: any;
    alipay_trade_no: string;
  }
}

export interface AlipayPaymentConfig {
  /**
   * 支付渠道
   */
  channel: 'web' | 'app';
  /**
   * 当前支付类型支持的货币
   */
  currency?: string;
  /**
   * 支付宝APP ID
   */
  app_id: string;
  /**
   * 支付宝商户秘钥路径或内容
   */
  private_key: string | Buffer;
  /**
   * 支付宝公钥路径或内容
   */
  alipay_public_key: string | Buffer;
  /**
   * 签名方法
   */
  sign_type?: 'RSA2' | 'RSA';
  /**
   * 支付回调地址
   */
  notify_url: string;
  return_url?: string;
  biz_content?: {
    /**
     * 该笔订单允许的最晚付款时间，逾期将关闭交易。
     * 取值范围：1m～15d。m-分钟，h-小时，d-天，1c-当天（1c-当天的情况下，无论交易何时创建，都在0点关闭）。
     * 该参数数值不接受小数点， 如 1.5h，可转换为 90m。
     * 注：若为空，则默认为15d。
     */
    timeout_express?: string;
    /**
     * 0—虚拟类商品，1—实物类商品
     */
    goods_type?: '0' | '1';
    /**
     * 优惠参数，仅与支付宝协商后可用
     */
    promo_params?: any;
    /**
     * 业务扩展参数
     */
    extend_params?: any;
    /**
     * 可用渠道，用户只能在指定渠道范围内支付，当有多个渠道时用“,”分隔。
     * 与disable_pay_channels互斥
     */
    enable_pay_channels?: string;
    /**
     * 禁用渠道，用户不可用指定渠道支付，当有多个渠道时用“,”分隔。
     * 与enable_pay_channels互斥
     */
    disable_pay_channels?: string;
    /**
     * 商户门店编号。该参数用于请求参数中以区分各门店，非必传项。
     */
    store_id?: string;
    /**
     * 外部指定买家
     */
    ext_user_info?: any;
  };
}

export interface CallbackData {
  [key: string]: any;
  sign?: string;
}

export interface AlipayPaymentPluginConfig extends PluginConfig {
  channels: {
    [channel: string]: AlipayPaymentConfig;
  }
}

export default class AlipayPaymentPlugin extends PaymentPlugin<AlipayPaymentPluginConfig> {
}
