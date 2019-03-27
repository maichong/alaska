"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_user_1 = require("alaska-user");
const Login_1 = require("alaska-user/sleds/Login");
const Logout_1 = require("alaska-user/sleds/Logout");
const __1 = require("..");
function default_1(router) {
    router.post('/login', async (ctx) => {
        ctx.state.adminApi = 'login';
        ctx.service = __1.default;
        const body = ctx.request.body || {};
        let username = body.username || __1.default.error('Username is required');
        let password = body.password || __1.default.error('Password is required');
        let user = await Login_1.default.run({ ctx, username, password }, { dbSession: ctx.dbSession });
        let authorized = await alaska_user_1.default.hasAbility(user, 'admin');
        ctx.body = Object.assign({ authorized }, user.data());
    });
    router.get('/logout', async (ctx) => {
        ctx.state.adminApi = 'logout';
        ctx.service = __1.default;
        await Logout_1.default.run({ ctx }, { dbSession: ctx.dbSession });
        ctx.body = {};
    });
}
exports.default = default_1;
