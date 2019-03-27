"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_sled_1 = require("alaska-sled");
const Captcha_1 = require("../models/Captcha");
const __1 = require("..");
class Verify extends alaska_sled_1.Sled {
    async exec(params) {
        if (!params.code)
            return false;
        if (!params.to && !params.user)
            return false;
        let to = params.to;
        if (!to) {
            if (!params.user)
                return false;
            let captcha = await Captcha_1.default.findById(params.id);
            if (!captcha || captcha.anonymous)
                return false;
            to = params.user.get(captcha.userField);
            if (!to)
                return false;
        }
        const CACHE = __1.default.cache;
        let cacheKey = `captcha:${params.id}:${to}`;
        let cache = await CACHE.get(cacheKey);
        if (!cache || cache !== params.code) {
            return false;
        }
        CACHE.del(cacheKey);
        return true;
    }
}
exports.default = Verify;
