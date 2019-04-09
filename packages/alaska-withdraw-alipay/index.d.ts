import { PluginConfig } from 'alaska';
import { WithdrawPlugin } from 'alaska-withdraw';

export interface AlipayWithdrawConfig {
  /**
   * 提现支付类型标签
   */
  label?: string;
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
   * 签名方法
   */
  sign_type?: 'RSA2' | 'RSA';
  /**
   * alipay.fund.trans.toaccount.transfer 接口业务参数
   * https://docs.open.alipay.com/api_28/alipay.fund.trans.toaccount.transfer
   */
  biz_content?: {
    /**
     * 付款方姓名（最长支持100个英文/50个汉字）。
     * 显示在收款方的账单详情页。如果该字段不传，则默认显示付款方的支付宝认证姓名或单位名称。
     */
    payer_show_name?: string;
  };
}

export interface AlipayWithdrawPluginConfig extends PluginConfig {
  channels: {
    [channel: string]: AlipayWithdrawConfig;
  };
}

export default class AlipayWithdrawPlugin extends WithdrawPlugin<AlipayWithdrawPluginConfig> {
}
