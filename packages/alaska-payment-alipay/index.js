"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const fs = require("fs");
const crypto = require("crypto");
const moment = require("moment");
const akita_1 = require("akita");
const alaska_payment_1 = require("alaska-payment");
const utils_1 = require("./utils");
const client = akita_1.default.create({});
const GATEWAY = 'https://openapi.alipay.com/gateway.do';
class AlipayPaymentPlugin extends alaska_payment_1.PaymentPlugin {
    constructor(service) {
        super(service);
        let config = service.main.config.get('alaska-payment-alipay') || service.error('Missing config [alaska-payment-alipay]');
        this.configs = new Map();
        for (let key of _.keys(config)) {
            let options = config[key];
            ['channel', 'app_id', 'private_key', 'alipay_public_key', 'notify_url'].forEach((k) => {
                if (!options[k])
                    throw new Error(`Missing config [alaska-payment-alipay.${key}.${k}]`);
            });
            if (typeof options.private_key === 'string') {
                options.private_key = fs.readFileSync(options.private_key);
            }
            if (typeof options.alipay_public_key === 'string') {
                options.alipay_public_key = fs.readFileSync(options.alipay_public_key);
            }
            this.configs.set(`alipay:${key}`, options);
            service.payments.set(`alipay:${key}`, this);
        }
    }
    async createParams(payment) {
        const options = this.configs.get(payment.type);
        if (!options)
            throw new Error('Unsupported payment type!');
        if (payment.currency && options.currency && payment.currency !== options.currency)
            throw new Error('Currency not match!');
        if (payment.amount === 0) {
            return 'success';
        }
        let params = {
            app_id: options.app_id,
            method: '',
            charset: 'utf-8',
            sign_type: options.sign_type || 'RSA2',
            timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
            version: '1.0',
            notify_url: options.notify_url,
            biz_content: {
                subject: utils_1.substr(payment.title, 256),
                out_trade_no: payment.id,
                total_amount: payment.amount,
                product_code: ''
            }
        };
        switch (options.channel) {
            case 'app':
                params.method = 'alipay.trade.app.pay';
                params.biz_content.product_code = 'QUICK_MSECURITY_PAY';
                break;
            case 'web':
                params.method = 'alipay.trade.page.pay';
                if (options.return_url) {
                    params.return_url = options.return_url;
                }
                params.biz_content.product_code = 'FAST_INSTANT_TRADE_PAY';
                params.biz_content.qr_pay_mode = '2';
                break;
            default:
                throw new Error('Unsupported alipay channel');
        }
        params.biz_content = _.assign(params.biz_content, options.biz_content, payment.alipay_biz_content);
        let link = this.createQueryString(this.paramsFilter(params));
        let signer = crypto.createSign(options.sign_type === 'RSA' ? 'RSA-SHA1' : 'RSA-SHA256');
        signer.update(link, 'utf8');
        params.sign = signer.sign(options.private_key, 'base64');
        let payParams = this.createQueryStringUrlencode(params);
        if (options.channel === 'app') {
            return payParams;
        }
        return GATEWAY + '?' + payParams;
    }
    async verify(data, payment) {
        const options = this.configs.get(payment.type);
        if (!options)
            return false;
        let filtered = this.paramsFilter(data);
        delete filtered.sign_type;
        let link = this.createQueryString(filtered);
        let verify = crypto.createVerify(options.sign_type === 'RSA' ? 'RSA-SHA1' : 'RSA-SHA256');
        verify.update(link, 'utf8');
        return verify.verify(options.alipay_public_key, data.sign, 'base64');
    }
    async refund(refund, payment) {
        if (refund.amount === 0) {
            refund.state = 'success';
            return;
        }
        const options = this.configs.get(payment.type);
        if (!options)
            throw new Error('Unsupported payment type!');
        let params = {
            app_id: options.app_id,
            method: 'alipay.trade.refund',
            charset: 'utf-8',
            sign_type: options.sign_type || 'RSA2',
            timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
            version: '1.0',
            notify_url: options.notify_url,
            biz_content: _.assign({
                out_trade_no: payment.id,
                refund_amount: refund.amount,
                out_request_no: refund.id,
            }, options.biz_content, refund.alipay_biz_content)
        };
        let link = this.createQueryString(this.paramsFilter(params));
        let signer = crypto.createSign(options.sign_type === 'RSA' ? 'RSA-SHA1' : 'RSA-SHA256');
        signer.update(link, 'utf8');
        params.sign = signer.sign(options.private_key, 'base64');
        let { alipay_trade_refund_response: res } = await client.post(GATEWAY, {
            body: params
        });
        if (res.msg === 'Success') {
            refund.alipay_trade_no = res.trade_no;
            refund.state = 'success';
        }
        else {
            refund.state = 'failed';
            refund.failure = res.sub_code;
        }
    }
    paramsFilter(params) {
        return _.reduce(params, (result, value, key) => {
            if (value && key !== 'sign') {
                result[key] = value;
            }
            return result;
        }, {});
    }
    createQueryString(params) {
        return _.keys(params).sort().map((key) => {
            let value = params[key];
            if (_.isPlainObject(value)) {
                value = JSON.stringify(value);
            }
            return `${key}=${value}`;
        }).join('&');
    }
    createQueryStringUrlencode(params) {
        return _.keys(params).sort().map((key) => {
            let value = params[key];
            if (_.isPlainObject(value)) {
                value = JSON.stringify(value);
            }
            return `${key}=${encodeURIComponent(value)}`;
        }).join('&');
    }
}
exports.default = AlipayPaymentPlugin;
