"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Send_1 = require("../sleds/Send");
async function send(ctx) {
    let id = ctx.request.body.id || ctx.throw(400, 'id is required');
    let to = ctx.request.body.to;
    await Send_1.default.run({ id, to, locale: ctx.locale, user: ctx.user }, { dbSession: ctx.dbSession });
    ctx.body = {};
}
exports.send = send;
