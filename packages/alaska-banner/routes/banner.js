"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Banner_1 = require("../models/Banner");
function default_1(router) {
    router.get('/banner/redirect/:id', async (ctx, next) => {
        let id = ctx.params.id;
        if (!/^[0-9a-f]{24}$/.test(id)) {
            await next();
            return;
        }
        let banner = await Banner_1.default.findById(id);
        if (!banner || !banner.isValid() || !banner.url) {
            await next();
            return;
        }
        await Banner_1.default.findByIdAndUpdate(banner._id, { $inc: { clicks: 1 } });
        ctx.redirect(banner.url);
    });
}
exports.default = default_1;
