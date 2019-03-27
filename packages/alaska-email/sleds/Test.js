"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_sled_1 = require("alaska-sled");
const Send_1 = require("./Send");
class Test extends alaska_sled_1.Sled {
    async exec(params) {
        let record = params.record;
        await Send_1.default.run({
            email: record,
            to: params.body.testTo,
            values: params.body.testData
        }, { dbSession: this.dbSession });
        return record;
    }
}
exports.default = Test;
