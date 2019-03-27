"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const alaska_http_1 = require("alaska-http");
const Login_1 = require("../sleds/Login");
const Logout_1 = require("../sleds/Logout");
async function login(ctx) {
    let body = ctx.state.body || _.pick(ctx.request.body, 'username', 'password', 'channel', 'remember');
    if (!body.username)
        ctx.throw(400, 'Username is required');
    if (!body.password)
        ctx.throw(400, 'Password is required');
    let user = await Login_1.default.run(_.assign({ ctx }, body));
    ctx.body = user.data('info');
}
exports.default = login;
alaska_http_1.GET(logout);
alaska_http_1.POST(logout);
async function logout(ctx) {
    await Logout_1.default.run({ ctx });
    ctx.body = {};
}
exports.logout = logout;
