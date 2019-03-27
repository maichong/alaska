"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_sled_1 = require("alaska-sled");
const alaska_settings_1 = require("alaska-settings");
const escape = require("escape-string-regexp");
const _ = require("lodash");
const __1 = require("..");
const User_1 = require("../models/User");
class Register extends alaska_sled_1.Sled {
    async exec(params) {
        let closeRegister = await alaska_settings_1.default.get('user.closeRegister');
        if (closeRegister) {
            let closeRegisterReason = await alaska_settings_1.default.get('user.closeRegisterReason');
            __1.default.error(closeRegisterReason || 'Register closed');
        }
        let user = params.user;
        if (!user) {
            if (params.username) {
                let count = await User_1.default.countDocuments({
                    username: new RegExp(`^${escape(params.username)}$`, 'i')
                }).session(this.dbSession);
                if (count) {
                    __1.default.error('Username is exists');
                }
            }
            if (params.email) {
                let emailCount = await User_1.default.countDocuments({
                    email: new RegExp(`^${escape(params.email)}$`, 'i')
                }).session(this.dbSession);
                if (emailCount) {
                    __1.default.error('Email is exists');
                }
            }
            user = new User_1.default(_.omit(params, 'ctx', 'user'));
        }
        if (!user.roles) {
            user.roles = [];
        }
        if (!user.roles.includes('user')) {
            user.roles.push('user');
        }
        await user.save({ session: this.dbSession });
        if (params.ctx && params.ctx.session) {
            params.ctx.session.userId = user.id;
        }
        return user;
    }
}
exports.default = Register;
