"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer = require("nodemailer");
const alaska_email_1 = require("alaska-email");
class EmailSmtpDriver extends alaska_email_1.EmailDriver {
    constructor(options, service) {
        super(options, service);
        this._driver = nodemailer.createTransport(options.smtp);
    }
    async send(data) {
        return this._driver.sendMail(data);
    }
}
exports.default = EmailSmtpDriver;
