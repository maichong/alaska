"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_user_1 = require("alaska-user");
const Create_1 = require("../sleds/Create");
async function create(ctx) {
    if (!ctx.state.ignoreAuthorization) {
        if (!ctx.user)
            ctx.throw(401);
        let ability = 'alaska-inventory.Inventory.create';
        if (!await alaska_user_1.default.hasAbility(ctx.user, ability))
            ctx.throw(403);
    }
    let body = ctx.state.body || ctx.request.body;
    await Create_1.default.run({
        user: ctx.user,
        body
    }, { dbSession: ctx.dbSession });
}
exports.create = create;
