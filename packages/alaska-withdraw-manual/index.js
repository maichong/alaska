"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const alaska_withdraw_1 = require("alaska-withdraw");
const Withdraw_1 = require("alaska-withdraw/models/Withdraw");
class ManualWithdrawPlugin extends alaska_withdraw_1.WithdrawPlugin {
    constructor(pluginConfig, service) {
        super(pluginConfig, service);
        if (_.isEmpty(pluginConfig.channels))
            throw new Error(`Missing config [alaska-withdraw/plugins.alaska-withdraw-manual.channels]`);
        this.configs = new Map();
        for (let key of _.keys(pluginConfig.channels)) {
            let config = pluginConfig.channels[key];
            let type = `manual:${key}`;
            this.configs.set(type, config);
            service.withdrawPlugins.set(type, this);
            if (!_.find(Withdraw_1.default.fields.type.options, (opt) => opt.value === type)) {
                Withdraw_1.default.fields.type.options.push({
                    label: config.label || 'Manual',
                    value: type
                });
            }
        }
    }
    async withdraw(withdraw) {
        const config = this.configs.get(withdraw.type);
        if (!config)
            throw new Error('Unsupported alipay withdraw type!');
    }
}
exports.default = ManualWithdrawPlugin;
