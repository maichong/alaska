"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const minimatch = require("minimatch");
const alaska_captcha_1 = require("alaska-captcha");
const Verify_1 = require("alaska-captcha/sleds/Verify");
function default_1(options, main) {
    if (!options || !options.paths || !_.isObject(options.paths)) {
        throw new Error('CaptchaService middleware \'paths\' error');
    }
    let paths = _.keys(options.paths);
    if (!paths.length)
        throw new Error('CaptchaService middleware \'paths\' can not empty');
    _.forEach(options.paths, (info, path) => {
        if (!info.id)
            throw new Error(`Missing config [middlewares.alaska-middleware-captcha.paths[${path}].id]`);
        if (!info.to)
            throw new Error(`Missing config [middlewares.alaska-middleware-captcha.paths[${path}].to]`);
    });
    return async function (ctx, next) {
        if (!main.lookup('alaska-captcha')) {
            await next();
            return;
        }
        let path = _.find(paths, (item) => minimatch(ctx.path, item));
        if (!path) {
            await next();
            return;
        }
        ctx.state.jsonApi = true;
        let params = options.paths[path];
        let stateBody = ctx.state.body || {};
        let requestBody = ctx.request.body || {};
        let to = stateBody[params.to] || requestBody[params.to];
        let code = stateBody[params.captcha || 'captcha'] || requestBody[params.captcha || 'captcha'];
        if (!code) {
            alaska_captcha_1.default.error('Invalid captcha', 400);
        }
        let success = await Verify_1.default.run({ id: params.id, to, code, user: ctx.user }, { dbSession: ctx.dbSession });
        if (!success) {
            alaska_captcha_1.default.error('Invalid captcha', 400);
        }
        await next();
    };
}
exports.default = default_1;
