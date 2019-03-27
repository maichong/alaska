"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_sled_1 = require("alaska-sled");
const AdminNav_1 = require("../models/AdminNav");
class RegisterNav extends alaska_sled_1.Sled {
    async exec(params) {
        const id = params.id;
        let record = await AdminNav_1.default.findById(id);
        if (record) {
            return record;
        }
        record = new AdminNav_1.default(params);
        record._id = id;
        await record.save({ session: this.dbSession });
        return record;
    }
}
exports.default = RegisterNav;
