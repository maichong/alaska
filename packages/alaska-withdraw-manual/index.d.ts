import { PluginConfig } from 'alaska';
import { WithdrawPlugin } from 'alaska-withdraw';

export interface ManualWithdrawConfig {
  /**
   * 提现支付类型标签
   */
  label?: string;
}

export interface ManualWithdrawPluginConfig extends PluginConfig {
  channels: {
    [channel: string]: ManualWithdrawConfig;
  };
}

export default class ManualWithdrawPlugin extends WithdrawPlugin<ManualWithdrawPluginConfig> {
}
