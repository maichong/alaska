"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
async function show(ctx, next) {
    await next();
    if (ctx.user && ctx.body && ctx.body.id) {
        let Favorite = alaska_model_1.Model.lookup('alaska-favorite.Favorite');
        if (Favorite) {
            ctx.body.favorite = (await Favorite.findOne({ user: ctx.user._id, type: 'post', post: ctx.body.id }).select('_id') || { id: '' }).id;
        }
    }
}
exports.show = show;
