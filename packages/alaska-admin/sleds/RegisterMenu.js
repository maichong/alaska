"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_sled_1 = require("alaska-sled");
const AdminMenu_1 = require("../models/AdminMenu");
class RegisterMenu extends alaska_sled_1.Sled {
    async exec(params) {
        const id = params.id;
        let record = await AdminMenu_1.default.findById(id);
        if (record) {
            return record;
        }
        record = new AdminMenu_1.default(params);
        record._id = id;
        if (!record.parent && !record.nav) {
            record.nav = 'default';
        }
        await record.save({ session: this.dbSession });
        return record;
    }
}
exports.default = RegisterMenu;
