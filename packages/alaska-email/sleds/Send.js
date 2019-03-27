"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_sled_1 = require("alaska-sled");
const nunjucks = require("nunjucks");
const Email_1 = require("../models/Email");
const __1 = require("..");
class Send extends alaska_sled_1.Sled {
    async exec(params) {
        let email;
        let driver = __1.default.drivers.get('default');
        let to = params.to;
        if (params.email) {
            if (typeof params.email === 'string') {
                email = await Email_1.default.findById(email);
            }
            else {
                email = params.email;
            }
        }
        if (!email)
            throw new Error('Can not find email');
        if (params.driver && typeof params.driver === 'string') {
            driver = __1.default.drivers.get(params.driver);
        }
        else if (email.driver) {
            driver = __1.default.drivers.get(email.driver);
        }
        if (!driver) {
            throw new Error('Email driver not found!');
        }
        if (to && typeof to === 'object' && to.email) {
            let user = to;
            if (user.displayName) {
                to = `"${user.displayName}" <${user.email}>`;
            }
            else {
                to = user.email;
            }
        }
        let content = nunjucks.renderString(email.content, params.values || {});
        return await driver.send(Object.assign({
            to,
            subject: email.subject,
            html: content
        }, params.options));
    }
}
exports.default = Send;
