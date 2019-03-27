"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const fs = require("fs");
const https = require("https");
const stringRandom = require("string-random");
const akita_1 = require("akita");
const alaska_payment_1 = require("alaska-payment");
const User_1 = require("alaska-user/models/User");
const utils_1 = require("./utils");
const client = akita_1.default.create({});
class WeixinPaymentPlugin extends alaska_payment_1.PaymentPlugin {
    constructor(service) {
        super(service);
        let config = service.main.config.get('alaska-payment-weixin') || service.error('Missing config [alaska-payment-weixin]');
        if (_.isEmpty(config))
            throw new Error('No weixin payment channel found!');
        this.configs = new Map();
        for (let key of _.keys(config)) {
            let options = config[key];
            ['channel', 'appid', 'secret', 'mch_id', 'pay_key', 'notify_url', 'currency'].forEach((k) => {
                if (!options[k])
                    throw new Error(`Missing config [alaska-payment-weixin.${key}.${k}]`);
            });
            if (options.pfx && typeof options.pfx === 'string') {
                options.pfx = fs.readFileSync(options.pfx);
            }
            this.currencies.add(options.currency);
            this.configs.set(`weixin:${key}`, options);
            service.payments.set(`weixin:${key}`, this);
        }
    }
    async createParams(payment) {
        const options = this.configs.get(payment.type);
        if (!options)
            throw new Error('Unsupported payment type!');
        if (payment.currency && payment.currency !== options.currency)
            throw new Error('Currency not match!');
        if (payment.amount === 0) {
            return 'success';
        }
        let openid = payment.openid;
        if (!openid) {
            let user = await User_1.default.findById(payment.user).select('openid');
            if (user) {
                openid = user.openid;
                if (openid) {
                    payment.openid = openid;
                }
            }
        }
        let order = await this.unifiedorder({
            openid,
            body: utils_1.substr(payment.title, 128),
            out_trade_no: payment.id,
            spbill_create_ip: payment.ip,
            total_fee: _.round(payment.amount * 100),
        }, options);
        return JSON.stringify(this._getPayParamsByPrepay(order, options));
    }
    async verify(data, payment) {
        const options = this.configs.get(payment.type);
        if (!options)
            return false;
        let sign = this._getSign(data, options);
        return data.sign === sign;
    }
    async refund(refund, payment) {
        if (refund.amount === 0) {
            refund.state = 'success';
            return;
        }
        const options = this.configs.get(payment.type);
        if (!options)
            throw new Error('Unsupported payment type!');
        if (!options.pfx)
            throw new Error('Weixin refund require pfx!');
        let req = {
            appid: options.appid,
            mch_id: options.mch_id,
            nonce_str: stringRandom(16),
            sign_type: options.sign_type || 'MD5',
            out_trade_no: payment.id,
            out_refund_no: refund.id,
            total_fee: payment.amount * 100 | 0,
            refund_fee: refund.amount * 100 | 0,
            op_user_id: options.mch_id,
        };
        req.sign = this._getSign(req, options);
        let xml = await client.post('https://api.mch.weixin.qq.com/secapi/pay/refund', {
            agent: new https.Agent({
                pfx: options.pfx,
                passphrase: options.mch_id
            }),
            body: utils_1.data2xml(req)
        }).text();
        let json = await utils_1.xml2data(xml);
        if (json.return_msg && json.return_msg !== 'OK') {
            throw new Error(json.return_msg);
        }
        refund.weixin_refund_id = json.refund_id;
        refund.state = 'success';
    }
    async orderquery(orderId, options) {
        let data = {
            appid: options.appid,
            mch_id: options.mch_id,
            nonce_str: stringRandom(),
            out_trade_no: orderId
        };
        data.sign = this._getSign(data, options);
        let xml = utils_1.data2xml(data);
        let result = await client.post('https://api.mch.weixin.qq.com/pay/orderquery', {
            body: xml
        }).text();
        return await utils_1.xml2data(result);
    }
    async unifiedorder(data, options) {
        _.defaults(data, {
            appid: options.appid,
            mch_id: options.mch_id,
            nonce_str: stringRandom(),
            notify_url: options.notify_url,
            trade_type: this._getTradeType(options.channel),
            spbill_create_ip: data.spbill_create_ip || '127.0.0.1'
        });
        data.sign = this._getSign(data, options);
        let xml = utils_1.data2xml(data);
        let result = await client.post('https://api.mch.weixin.qq.com/pay/unifiedorder', {
            body: xml
        }).text();
        let json = await utils_1.xml2data(result);
        if (json.return_msg && json.return_msg !== 'OK') {
            throw new Error(json.return_msg);
        }
        return json;
    }
    _getPayParamsByPrepay(data, options) {
        if (options.channel === 'app') {
            let req = {
                appid: options.appid,
                noncestr: stringRandom(),
                package: 'Sign=WXPay',
                partnerid: options.mch_id,
                prepayid: data.prepay_id,
                timestamp: Date.now() / 1000 | 0
            };
            return {
                appId: options.appid,
                partnerId: options.mch_id,
                prepayId: data.prepay_id,
                package: 'Sign=WXPay',
                nonceStr: req.noncestr,
                timeStamp: req.timestamp,
                sign: this._getSign(req, options)
            };
        }
        let params;
        params = {
            appId: data.appid,
            timeStamp: String((Date.now() / 1000 | 0)),
            nonceStr: stringRandom(),
            package: `prepay_id=${data.prepay_id}`,
            signType: options.sign_type || 'MD5'
        };
        params.paySign = this._getSign(params, options);
        delete params.appId;
        if (options.channel === 'jssdk') {
            params.timestamp = params.timeStamp;
        }
        return params;
    }
    _getTradeType(channel) {
        switch (channel) {
            case 'jssdk':
            case 'wxapp':
                return 'JSAPI';
            case 'app':
                return 'APP';
            case 'native':
                return 'NATIVE';
            case 'h5':
                return 'MWEB';
            default:
                throw new Error(`Unsupported payment channel ${channel}`);
        }
    }
    _getSign(data, options) {
        let str = `${utils_1.toQueryString(data)}&key=${options.pay_key}`;
        if (options.sign_type === 'SHA256') {
            return utils_1.sha256(str, options.pay_key).toUpperCase();
        }
        return utils_1.md5(str).toUpperCase();
    }
}
exports.default = WeixinPaymentPlugin;
