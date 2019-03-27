"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_sled_1 = require("alaska-sled");
class Complete extends alaska_sled_1.Sled {
    async exec(params) {
        if (this.result)
            return;
        if (!params.done)
            this.service.error('No valid payment complete hooks');
        let record = params.record;
        record.state = 'success';
        await record.save({ session: this.dbSession });
        return record;
    }
}
exports.default = Complete;
