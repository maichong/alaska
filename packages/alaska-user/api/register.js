"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const Register_1 = require("../sleds/Register");
async function register(ctx) {
    let body = ctx.state.body || _.pick(ctx.request.body, 'username', 'password');
    if (!body.username)
        ctx.throw(400, 'Username is required');
    if (!body.password)
        ctx.throw(400, 'Password is required');
    let user = await Register_1.default.run(_.assign({ ctx }, body), { dbSession: ctx.dbSession });
    ctx.body = user.data('info');
}
exports.default = register;
