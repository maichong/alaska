"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_sled_1 = require("alaska-sled");
class Accept extends alaska_sled_1.Sled {
    async exec(params) {
        let record = params.record;
        if (record.state === 'pending') {
            record.state = 'accepted';
            await record.save({ session: this.dbSession });
        }
        return record;
    }
}
exports.default = Accept;
