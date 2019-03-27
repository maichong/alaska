"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_user_1 = require("alaska-user");
const Favorite_1 = require("../models/Favorite");
const Create_1 = require("../sleds/Create");
const __1 = require("..");
async function create(ctx) {
    if (!ctx.user)
        __1.default.error(403);
    let body = ctx.state.body || ctx.request.body;
    let record = await Create_1.default.run(Object.assign({}, body, { user: ctx.user._id }), { dbSession: ctx.dbSession });
    let data = record.data();
    alaska_user_1.default.trimProtectedField(data, ctx.user, Favorite_1.default, record);
    ctx.body = data;
}
exports.create = create;
