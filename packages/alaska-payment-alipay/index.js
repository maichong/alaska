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
    constructor(pluginConfig, service) {
        super(pluginConfig, service);
        if (_.isEmpty(pluginConfig.channels))
            throw new Error(`Missing config [alaska-payment/plugins.alaska-payment-alipay.channels]`);
        this.configs = new Map();
        for (let key of _.keys(pluginConfig.channels)) {
            let config = pluginConfig.channels[key];
            ['platform', 'app_id', 'private_key', 'alipay_public_key', 'notify_url'].forEach((k) => {
                if (!config[k])
                    throw new Error(`Missing config [alaska-payment/plugins.alaska-payment-alipay.${key}.${k}]`);
            });
            if (typeof config.private_key === 'string') {
                config.private_key = fs.readFileSync(config.private_key);
            }
            if (typeof config.alipay_public_key === 'string') {
                config.alipay_public_key = fs.readFileSync(config.alipay_public_key);
            }
            this.configs.set(`alipay:${key}`, config);
            service.paymentPlugins.set(`alipay:${key}`, this);
        }
    }
    async createParams(payment) {
        const config = this.configs.get(payment.type);
        if (!config)
            throw new Error('Unsupported alipay payment type!');
        if (payment.currency && config.currency && payment.currency !== config.currency)
            throw new Error('Currency not match!');
        if (payment.amount === 0) {
            return 'success';
        }
        let params = {
            app_id: config.app_id,
            method: '',
            charset: 'utf-8',
            sign_type: config.sign_type || 'RSA2',
            timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
            version: '1.0',
            notify_url: config.notify_url,
            biz_content: {
                subject: utils_1.substr(payment.title, 256),
                out_trade_no: payment.id,
                total_amount: payment.amount,
                product_code: ''
            }
        };
        switch (config.platform) {
            case 'app':
                params.method = 'alipay.trade.app.pay';
                params.biz_content.product_code = 'QUICK_MSECURITY_PAY';
                break;
            case 'web':
                params.method = 'alipay.trade.page.pay';
                if (config.return_url) {
                    params.return_url = config.return_url;
                }
                params.biz_content.product_code = 'FAST_INSTANT_TRADE_PAY';
                params.biz_content.qr_pay_mode = '2';
                break;
            default:
                throw new Error('Unsupported alipay payment platform');
        }
        params.biz_content = _.assign(params.biz_content, config.biz_content, payment.alipayBizContent);
        let queryString = this.createQueryString(this.paramsFilter(params));
        let signer = crypto.createSign(config.sign_type === 'RSA' ? 'RSA-SHA1' : 'RSA-SHA256');
        signer.update(queryString, 'utf8');
        params.sign = signer.sign(config.private_key, 'base64');
        let payParams = this.createQueryStringUrlencode(params);
        if (config.platform === 'app') {
            return payParams;
        }
        return `${GATEWAY}?${payParams}`;
    }
    async verify(data, payment) {
        const config = this.configs.get(payment.type);
        if (!config)
            return false;
        let filtered = this.paramsFilter(data);
        delete filtered.sign_type;
        let queryString = this.createQueryString(filtered);
        let verify = crypto.createVerify(config.sign_type === 'RSA' ? 'RSA-SHA1' : 'RSA-SHA256');
        verify.update(queryString, 'utf8');
        return verify.verify(config.alipay_public_key, data.sign, 'base64');
    }
    async refund(refund, payment) {
        if (refund.amount === 0) {
            refund.state = 'success';
            return;
        }
        const config = this.configs.get(payment.type);
        if (!config)
            throw new Error('Unsupported payment type!');
        let params = {
            app_id: config.app_id,
            method: 'alipay.trade.refund',
            charset: 'utf-8',
            sign_type: config.sign_type || 'RSA2',
            timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
            version: '1.0',
            notify_url: config.notify_url,
            biz_content: _.assign({
                out_trade_no: payment.id,
                refund_amount: refund.amount,
                out_request_no: refund.id,
            }, config.biz_content, refund.alipayBizContent)
        };
        let queryString = this.createQueryString(this.paramsFilter(params));
        let signer = crypto.createSign(config.sign_type === 'RSA' ? 'RSA-SHA1' : 'RSA-SHA256');
        signer.update(queryString, 'utf8');
        params.sign = signer.sign(config.private_key, 'base64');
        let url = GATEWAY + '?' + this.createQueryStringUrlencode(params);
        let { alipay_trade_refund_response: res } = await client.post(url);
        if (res.msg === 'Success') {
            refund.alipayTradeNo = res.trade_no;
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
