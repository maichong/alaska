"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_sled_1 = require("alaska-sled");
const escape = require("escape-string-regexp");
const User_1 = require("../models/User");
const encryption_1 = require("../encryption");
const __1 = require("..");
let encryption;
class Login extends alaska_sled_1.Sled {
    async exec(params) {
        let user = params.user;
        if (!user) {
            user = await User_1.default.findOne({
                username: new RegExp(`^${escape(params.username)}$`, 'i')
            });
            if (!user) {
                __1.default.error('Incorrect username or password', 1101);
            }
        }
        if (!params.user || params.password) {
            let success = await user.auth(params.password);
            if (!success) {
                __1.default.error('Incorrect username or password', 1101);
            }
        }
        if (params.ctx && params.ctx.session) {
            params.ctx.session.userId = user.id;
        }
        if (params.remember !== false) {
            const autoLogin = __1.default.main.config.get('autoLogin');
            if (autoLogin && autoLogin.key && autoLogin.secret) {
                if (!encryption) {
                    encryption = new encryption_1.default(autoLogin.secret);
                }
                let cookie = `${user.id}:${encryption.hash(user.password)}:${Date.now().toString(36)}`;
                cookie = encryption.encrypt(cookie).toString('base64');
                params.ctx.cookies.set(autoLogin.key, cookie, autoLogin);
            }
        }
        return user;
    }
}
exports.default = Login;
