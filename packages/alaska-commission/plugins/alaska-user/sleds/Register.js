"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("alaska-user/models/User");
async function pre() {
    let ctx = this.params.ctx;
    let user = this.params.user;
    if (this.params.promoter || !ctx || (user && user.promoter))
        return;
    let promoter = ctx.cookies.get('p');
    if (!promoter)
        return;
    try {
        promoter = await User_1.default.findById(promoter).select('username');
        if (promoter) {
            this.params.promoter = promoter._id;
            if (user) {
                user.promoter = promoter._id;
            }
        }
    }
    catch (e) { }
}
exports.pre = pre;
