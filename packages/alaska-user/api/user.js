"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const alaska_http_1 = require("alaska-http");
const escapeStringRegexp = require("escape-string-regexp");
const User_1 = require("../models/User");
const __1 = require("..");
alaska_http_1.GET(info);
alaska_http_1.PATCH(info);
async function info(ctx) {
    let user = ctx.user;
    if (!user)
        __1.default.error(401);
    if (ctx.method === 'PATCH') {
        let body = ctx.state.body;
        if (!body) {
            body = _.assign({}, ctx.request.body);
            await __1.default.trimDisabledField(body, user, User_1.default, user);
        }
        user.set(body);
        await user.save({ session: ctx.dbSession });
    }
    ctx.body = user.data('info');
}
exports.info = info;
async function bindTel(ctx) {
    let user = ctx.user;
    if (!user)
        __1.default.error(401);
    let { tel } = ctx.state.body || ctx.request.body;
    if (!tel)
        __1.default.error('tel is required');
    if (await User_1.default.findOne({ tel }).select('_id'))
        __1.default.error('Tel has already exists');
    user.tel = tel;
    await user.save({ session: ctx.dbSession });
    ctx.body = user.data('info');
}
exports['bind-tel'] = bindTel;
async function bindEmail(ctx) {
    let user = ctx.user;
    if (!user)
        __1.default.error(401);
    let { email } = ctx.state.body || ctx.request.body;
    if (!email)
        __1.default.error('email is required');
    if (await User_1.default.findOne({
        email: new RegExp(`^${escapeStringRegexp(email)}$`, 'i')
    }).select('_id'))
        __1.default.error('Email has already exists');
    user.email = email;
    await user.save({ session: ctx.dbSession });
    ctx.body = user.data('info');
}
exports['bind-email'] = bindEmail;
async function passwd(ctx) {
    if (!ctx.user)
        __1.default.error(401);
    let body = ctx.state.body || ctx.request.body;
    if (!body || !body.password) {
        __1.default.error('New password is required');
    }
    ctx.user.password = body.password;
    await ctx.user.save({ session: ctx.dbSession });
    ctx.body = {};
}
exports.passwd = passwd;
