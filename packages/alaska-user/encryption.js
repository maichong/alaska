"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
class Encryption {
    constructor(password) {
        this.key = crypto.createHash('sha256').update(password).digest();
        this.iv = this.key.slice(0, 16);
    }
    encrypt(buf) {
        let cipher = crypto.createCipheriv('aes-256-cfb', this.key, this.iv);
        return Buffer.concat([cipher.update(buf), cipher.final()]);
    }
    decrypt(buf) {
        let cipher = crypto.createDecipheriv('aes-256-cfb', this.key, this.iv);
        return Buffer.concat([cipher.update(buf), cipher.final()]);
    }
    hash(input) {
        return crypto.createHash('sha256').update(input).digest('base64');
    }
}
exports.default = Encryption;
