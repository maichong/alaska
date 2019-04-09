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
    constructor(pluginConfig, service) {
        super(pluginConfig, service);
        if (_.isEmpty(pluginConfig.channels))
            throw new Error(`Missing config [alaska-payment/plugins.alaska-payment-weixin.channels]`);
        this.configs = new Map();
        for (let key of _.keys(pluginConfig.channels)) {
            let config = pluginConfig.channels[key];
            ['platform', 'appid', 'secret', 'mch_id', 'pay_key', 'notify_url'].forEach((k) => {
                if (!config[k])
                    throw new Error(`Missing config [/alaska-payment-weixin.${key}.${k}]`);
            });
            if (config.pfx && typeof config.pfx === 'string') {
                config.pfx = fs.readFileSync(config.pfx);
            }
            this.configs.set(`weixin:${key}`, config);
            service.paymentPlugins.set(`weixin:${key}`, this);
        }
    }
    async createParams(payment) {
        const config = this.configs.get(payment.type);
        if (!config)
            throw new Error('Unsupported payment type!');
        if (payment.currency && config.currency && payment.currency !== config.currency)
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
        }, config);
        return JSON.stringify(this._getPayParamsByPrepay(order, config));
    }
    async verify(data, payment) {
        const config = this.configs.get(payment.type);
        if (!config)
            return false;
        let sign = this._getSign(data, config);
        return data.sign === sign;
    }
    async refund(refund, payment) {
        if (refund.amount === 0) {
            refund.state = 'success';
            return;
        }
        const config = this.configs.get(payment.type);
        if (!config)
            throw new Error('Unsupported payment type!');
        if (!config.pfx)
            throw new Error('Weixin refund require pfx!');
        let req = {
            appid: config.appid,
            mch_id: config.mch_id,
            nonce_str: stringRandom(16),
            sign_type: config.sign_type || 'MD5',
            out_trade_no: payment.id,
            out_refund_no: refund.id,
            total_fee: payment.amount * 100 | 0,
            refund_fee: refund.amount * 100 | 0,
            op_user_id: config.mch_id,
        };
        req.sign = this._getSign(req, config);
        let xml = await client.post('https://api.mch.weixin.qq.com/secapi/pay/refund', {
            agent: new https.Agent({
                pfx: config.pfx,
                passphrase: config.mch_id
            }),
            body: utils_1.data2xml(req)
        }).text();
        let json = await utils_1.xml2data(xml);
        if (json.return_msg && json.return_msg !== 'OK') {
            throw new Error(json.return_msg);
        }
        refund.weixinRefundId = json.refund_id;
        refund.state = 'success';
    }
    async orderquery(orderId, config) {
        let data = {
            appid: config.appid,
            mch_id: config.mch_id,
            nonce_str: stringRandom(),
            out_trade_no: orderId
        };
        data.sign = this._getSign(data, config);
        let xml = utils_1.data2xml(data);
        let result = await client.post('https://api.mch.weixin.qq.com/pay/orderquery', {
            body: xml
        }).text();
        return await utils_1.xml2data(result);
    }
    async unifiedorder(data, config) {
        _.defaults(data, {
            appid: config.appid,
            mch_id: config.mch_id,
            nonce_str: stringRandom(),
            notify_url: config.notify_url,
            trade_type: this._getTradeType(config.platform),
            spbill_create_ip: data.spbill_create_ip || '127.0.0.1'
        });
        data.sign = this._getSign(data, config);
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
    _getPayParamsByPrepay(data, config) {
        if (config.platform === 'app') {
            let req = {
                appid: config.appid,
                noncestr: stringRandom(),
                package: 'Sign=WXPay',
                partnerid: config.mch_id,
                prepayid: data.prepay_id,
                timestamp: Date.now() / 1000 | 0
            };
            return {
                appId: config.appid,
                partnerId: config.mch_id,
                prepayId: data.prepay_id,
                package: 'Sign=WXPay',
                nonceStr: req.noncestr,
                timeStamp: req.timestamp,
                sign: this._getSign(req, config)
            };
        }
        let params;
        params = {
            appId: data.appid,
            timeStamp: String((Date.now() / 1000 | 0)),
            nonceStr: stringRandom(),
            package: `prepay_id=${data.prepay_id}`,
            signType: config.sign_type || 'MD5'
        };
        params.paySign = this._getSign(params, config);
        delete params.appId;
        if (config.platform === 'jssdk') {
            params.timestamp = params.timeStamp;
        }
        return params;
    }
    _getTradeType(platform) {
        switch (platform) {
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
                throw new Error(`Unsupported weixin payment platform ${platform}`);
        }
    }
    _getSign(data, config) {
        let str = `${utils_1.toQueryString(data)}&key=${config.pay_key}`;
        if (config.sign_type === 'SHA256') {
            return utils_1.sha256(str, config.pay_key).toUpperCase();
        }
        return utils_1.md5(str).toUpperCase();
    }
}
exports.default = WeixinPaymentPlugin;
