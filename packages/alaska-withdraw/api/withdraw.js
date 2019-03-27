"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Create_1 = require("../sleds/Create");
async function create(ctx) {
    let body = ctx.state.body || ctx.request.body;
    if (!ctx.state.ignoreAuthorization) {
        if (!ctx.user)
            ctx.throw(401);
        body.user = ctx.user;
        delete body.fields;
        body.ip = ctx.ip;
    }
    else {
        body = ctx.state.body || ctx.throw('Missing state.body when ignore authorization');
        if (!body.user) {
            body.user = ctx.user;
        }
        if (!body.ip) {
            body.ip = ctx.ip;
        }
    }
    let withdraw = await Create_1.default.run(body, { dbSession: ctx.dbSession });
    ctx.body = withdraw.data('create');
}
exports.create = create;
