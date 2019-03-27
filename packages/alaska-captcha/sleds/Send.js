"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const random = require("string-random");
const alaska_sled_1 = require("alaska-sled");
const __1 = require("..");
const Captcha_1 = require("../models/Captcha");
class Send extends alaska_sled_1.Sled {
    async exec(params) {
        const CACHE = __1.default.cache;
        let id = params.id;
        let to = params.to;
        let user = params.user;
        let locale = params.locale;
        let values = params.values || {};
        let captcha = await Captcha_1.default.findById(id).session(this.dbSession);
        if (!captcha)
            __1.default.error('Unknown captcha');
        if (captcha.anonymous && !to)
            throw new Error('to is required for send captcha!');
        if (!captcha.anonymous && !user)
            throw new Error('user is required for send captcha!');
        if (!captcha.anonymous) {
            to = user.get(captcha.userField) || __1.default.error('Can not get captcha destination field value for the user!');
        }
        let code = random(captcha.length, captcha.characters);
        values.code = code;
        let cacheKey = `captcha:${id}:${to}`;
        CACHE.set(cacheKey, code, captcha.lifetime * 1000 || 1800 * 1000);
        if (captcha.type === 'sms' && captcha.sms
            && __1.default.main && __1.default.main.allServices.get('alaska-sms')) {
            let SMS = __1.default.main.allServices.get('alaska-sms');
            await SMS.sleds.Send.run({
                to,
                sms: captcha.sms,
                locale,
                values
            }, { dbSession: this.dbSession });
        }
        else if (captcha.type === 'email' && captcha.email
            && __1.default.main && __1.default.main.allServices.get('alaska-email')) {
            let EMAIL = __1.default.main.allServices.get('alaska-email');
            await EMAIL.sleds.Send.run({
                to,
                email: captcha.email,
                locale,
                values
            }, { dbSession: this.dbSession });
        }
        else {
            throw new Error('unsupported captcha type');
        }
    }
}
exports.default = Send;
