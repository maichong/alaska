"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NormalError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        if (code > 100 && code < 600) {
            this.status = code;
        }
    }
}
exports.NormalError = NormalError;
