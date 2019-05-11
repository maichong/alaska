"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_sled_1 = require("alaska-sled");
class Logout extends alaska_sled_1.Sled {
    async exec(params) {
        let autoLogin = this.service.main.config.get('autoLogin');
        if (autoLogin && autoLogin.key) {
            params.ctx.cookies.set(autoLogin.key, '', autoLogin);
        }
        delete params.ctx.session.userId;
        delete params.ctx.session.password;
    }
}
exports.default = Logout;
