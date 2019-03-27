"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_user_1 = require("alaska-user");
const __1 = require("..");
const Complete_1 = require("../sleds/Complete");
const Create_1 = require("../sleds/Create");
const Payment_1 = require("../models/Payment");
async function create(ctx) {
    let body = ctx.state.body || ctx.request.body;
    if (!ctx.state.ignoreAuthorization) {
        let user = ctx.user || __1.default.error(401);
        if (!alaska_user_1.default.hasAbility(ctx.user, 'alaska-payment.Payment.create'))
            __1.default.error(403);
        body.user = user;
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
    let payment = await Create_1.default.run(body, { dbSession: ctx.dbSession });
    if (payment.params === 'success') {
        await Complete_1.default.run({ record: payment }, { dbSession: ctx.dbSession });
    }
    let data = payment.data('create');
    await alaska_user_1.default.trimProtectedField(data, ctx.user, Payment_1.default, payment);
    ctx.body = data;
}
exports.create = create;
