"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Create_1 = require("../sleds/Create");
const __1 = require("..");
async function create(ctx) {
    let body = ctx.state.body || ctx.request.body || {};
    if (!ctx.state.ignoreAuthorization) {
        let ability = 'alaska-image.Image.create';
        const userService = __1.default.main.allServices.get('alaska-user');
        if (userService && !await userService.hasAbility(ctx.user, ability))
            ctx.throw(ctx.user ? 403 : 401);
        body.user = ctx.user._id;
    }
    else {
        body = ctx.state.body || ctx.throw('Missing state.body when ignore authorization');
        if (!body.user && ctx.user) {
            body.user = ctx.user._id;
        }
    }
    let image = await Create_1.default.run({
        ctx,
        user: body.user,
        driver: body.driver,
    }, { dbSession: ctx.dbSession });
    ctx.body = image.data();
}
exports.create = create;
