"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const fs = require("fs");
const crypto = require("crypto");
const alaska_payment_1 = require("alaska-payment");
const GATEWAY = 'https://mapi.alipay.com/gateway.do?';
class AlipayPaymentPlugin extends alaska_payment_1.PaymentPlugin {
    constructor(service) {
        super(service);
        this.init(service);
    }
    init(service) {
        this.service = service;
        service.plugins.set('alipay', this);
        this.label = 'Alipay';
        let configTmp = service.config.get('alipay');
        if (!configTmp) {
            throw new Error('Alipay config not found');
        }
        this._config = configTmp;
        this._config = Object.assign({
            partner: '',
            seller_id: '',
            notify_url: '',
            return_url: '',
            service: 'create_direct_pay_by_user',
            payment_type: '1',
            _input_charset: 'utf-8',
            it_b_pay: '1d',
            sign_type: 'RSA'
        }, this._config);
        let rsa_private_key = this._config.rsa_private_key;
        if (!rsa_private_key)
            throw new Error('rsa_private_key not found');
        delete this._config.rsa_private_key;
        this.rsa_private_key = fs.readFileSync(rsa_private_key) || '';
        let rsa_public_key = this._config.rsa_public_key;
        if (!rsa_public_key)
            throw new Error('rsa_public_key not found');
        this.rsa_public_key = fs.readFileSync(rsa_public_key) || '';
        delete this._config.rsa_public_key;
    }
    async createParams(payment) {
        let params = Object.assign({}, this._config, {
            subject: payment.title,
            out_trade_no: payment._id,
            total_fee: payment.amount
        });
        let link = this.createQueryString(this.paramsFilter(params));
        let signer = crypto.createSign('RSA-SHA1');
        signer.update(link, 'utf8');
        params.sign = signer.sign(this.rsa_private_key.toString(), 'base64');
        return GATEWAY + this.createQueryStringUrlencode(params);
    }
    async verify(data) {
        let filtered = this.paramsFilter(data);
        let link = this.createQueryString(filtered);
        let verify = crypto.createVerify('RSA-SHA1');
        verify.update(link, 'utf8');
        return verify.verify(this.rsa_public_key, data.sign, 'base64');
    }
    paramsFilter(params) {
        return _.reduce(params, (result, value, key) => {
            if (value && key !== 'sign' && key !== 'sign_type') {
                result[key] = value;
            }
            return result;
        }, {});
    }
    createQueryString(params) {
        return Object.keys(params).sort().map((key) => `${key}=${params[key]}`).join('&');
    }
    createQueryStringUrlencode(params) {
        return Object.keys(params).sort().map((key) => `${key}=${encodeURIComponent(params[key])}`).join('&');
    }
}
exports.default = AlipayPaymentPlugin;
