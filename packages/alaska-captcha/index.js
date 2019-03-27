"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_1 = require("alaska");
class CaptchaService extends alaska_1.Service {
    preInit() {
        let cacheConfig = this.config.get('cache');
        if (!cacheConfig || !Object.keys(cacheConfig).length) {
            throw new Error(`Service '${this.id}' without cache driver!`);
        }
        this.cache = this.createDriver(cacheConfig);
    }
}
exports.default = new CaptchaService({ id: 'alaska-captcha' });
