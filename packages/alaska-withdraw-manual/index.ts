import * as _ from 'lodash';
import { WithdrawService, WithdrawPlugin } from 'alaska-withdraw';
import Withdraw from 'alaska-withdraw/models/Withdraw';
import { ManualWithdrawPluginConfig, ManualWithdrawConfig } from '.';

export default class ManualWithdrawPlugin extends WithdrawPlugin<ManualWithdrawPluginConfig> {
  service: WithdrawService;
  configs: Map<string, ManualWithdrawConfig>;

  constructor(pluginConfig: ManualWithdrawPluginConfig, service: WithdrawService) {
    super(pluginConfig, service);
    if (_.isEmpty(pluginConfig.channels)) throw new Error(`Missing config [alaska-withdraw/plugins.alaska-withdraw-manual.channels]`);

    this.configs = new Map();
    for (let key of _.keys(pluginConfig.channels)) {
      let config: ManualWithdrawConfig = pluginConfig.channels[key];

      let type = `manual:${key}`;

      this.configs.set(type, config);
      service.withdrawPlugins.set(type, this);

      if (!_.find(Withdraw.fields.type.options, (opt) => opt.value === type)) {
        Withdraw.fields.type.options.push({
          label: config.label || 'Manual',
          value: type
        });
      }
    }
  }

  async withdraw(withdraw: Withdraw): Promise<void> {
    const config = this.configs.get(withdraw.type);
    if (!config) throw new Error('Unsupported alipay withdraw type!');
  }
}
