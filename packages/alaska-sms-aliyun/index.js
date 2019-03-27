"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ini = require("ini");
const moment = require("moment");
const akita_1 = require("akita");
const crypto = require("crypto");
const driver_1 = require("alaska-sms/driver");
const api = akita_1.default.resolve('aliyun-sms-driver');
class SmsAliyunDriver extends driver_1.default {
    async send(to, message) {
        let config = ini.parse(message);
        if (!config.TemplateCode)
            throw new Error('Can not find TemplateCode in sms message content');
        if (!config.params) {
            config.params = {};
        }
        let object = {
            RegionId: 'cn-hangzhou',
            Action: 'SendSms',
            SignName: config.SignName || this.options.SignName,
            TemplateCode: config.TemplateCode,
            PhoneNumbers: to,
            TemplateParam: JSON.stringify(config.params),
            Format: 'JSON',
            Version: '2017-05-25',
            AccessKeyId: config.AccessKeyId || this.options.AccessKeyId,
            SignatureMethod: 'HMAC-SHA1',
            Timestamp: moment().toISOString(),
            SignatureVersion: '1.0',
            SignatureNonce: Math.random().toString().substr(2)
        };
        let params = Object.keys(object)
            .sort((a, b) => (a > b ? 1 : -1))
            .map((key) => (`${encodeURIComponent(key)}=${encodeURIComponent(object[key])}`))
            .join('&');
        let stringToSign = `POST&%2F&${encodeURIComponent(params)}`;
        let hmac = crypto.createHmac('sha1', `${config.AccessKeySecret || this.options.AccessKeySecret}&`);
        hmac.update(Buffer.from(stringToSign, 'utf-8'));
        let sign = hmac.digest('base64');
        return await api.post('http://dysmsapi.aliyuncs.com/', {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `${params}&Signature=${encodeURIComponent(sign)}`
        });
    }
}
exports.default = SmsAliyunDriver;
