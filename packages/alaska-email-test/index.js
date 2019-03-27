"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_email_1 = require("alaska-email");
class EmailTestDriver extends alaska_email_1.EmailDriver {
    send(message) {
        console.log('send email', message);
        return Promise.resolve({});
    }
}
exports.default = EmailTestDriver;
