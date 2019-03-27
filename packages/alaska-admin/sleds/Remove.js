"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_sled_1 = require("alaska-sled");
class Remove extends alaska_sled_1.Sled {
    async exec(params) {
        await Promise.all(params.records.map(async (record) => {
            record.$session(this.dbSession);
            await record.remove();
        }));
        return {};
    }
}
exports.default = Remove;
