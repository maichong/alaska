"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_1 = require("alaska");
class WithdrawService extends alaska_1.Service {
    constructor() {
        super(...arguments);
        this.withdrawPlugins = new Map();
    }
}
exports.default = new WithdrawService({
    id: 'alaska-withdraw'
});
class WithdrawPlugin extends alaska_1.Plugin {
    constructor() {
        super(...arguments);
        this.instanceOfWithdrawPlugin = true;
    }
}
WithdrawPlugin.classOfWithdrawPlugin = true;
exports.WithdrawPlugin = WithdrawPlugin;
