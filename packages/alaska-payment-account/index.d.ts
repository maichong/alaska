import { PluginConfig } from 'alaska';
import { PaymentPlugin } from 'alaska-payment';

export interface AccountPaymentPluginConfig extends PluginConfig {
  channels: {
    [channel: string]: {}
  };
}

export default class AccountPaymentPlugin extends PaymentPlugin<AccountPaymentPluginConfig> {
}
