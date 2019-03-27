"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const alaska_sled_1 = require("alaska-sled");
const __1 = require("..");
const Role_1 = require("../models/Role");
class RegisterRole extends alaska_sled_1.Sled {
    async exec(params) {
        this.service.debug('RegisterRole', params);
        let id = params.id;
        let roles = await __1.default.roles();
        let role = _.find(roles, (r) => r._id === id);
        if (role) {
            return role;
        }
        role = new Role_1.default(params);
        role._id = id;
        await role.save({ session: this.dbSession });
        return role;
    }
}
exports.default = RegisterRole;
