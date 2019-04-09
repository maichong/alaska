"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_sled_1 = require("alaska-sled");
const __1 = require("..");
class Accept extends alaska_sled_1.Sled {
    async exec(params) {
        let record = params.record;
        if (record.state === 'pending') {
            let plugin = __1.default.withdrawPlugins.get(record.type);
            if (!plugin)
                __1.default.error('Withdraw plugin not found');
            await plugin.withdraw(record);
            record.state = 'accepted';
            await record.save({ session: this.dbSession });
        }
        return record;
    }
}
exports.default = Accept;
