"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const random = require("string-random");
const alaska_1 = require("alaska");
const alaska_payment_1 = require("alaska-payment");
const urllib = require("urllib");
const utils = require("./utils/utils");
const GATEWAY = {
    micropay: 'https://api.mch.weixin.qq.com/pay/micropay',
    reverse: 'https://api.mch.weixin.qq.com/secapi/pay/reverse',
    unifiedorder: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
    orderquery: 'https://api.mch.weixin.qq.com/pay/orderquery',
    closeorder: 'https://api.mch.weixin.qq.com/pay/closeorder',
    refund: 'https://api.mch.weixin.qq.com/secapi/pay/refund',
    refundquery: 'https://api.mch.weixin.qq.com/pay/refundquery',
    downloadbill: 'https://api.mch.weixin.qq.com/pay/downloadbill',
    downloadfundflow: 'https://api.mch.weixin.qq.com/pay/downloadfundflow',
    send_coupon: 'https://api.mch.weixin.qq.com/mmpaymkttransfers/send_coupon',
    query_coupon_stock: 'https://api.mch.weixin.qq.com/mmpaymkttransfers/query_coupon_stock',
    querycouponsinfo: 'https://api.mch.weixin.qq.com/mmpaymkttransfers/querycouponsinfo',
    transfers: 'https://api.mch.weixin.qq.com/mmpaymkttransfers/promotion/transfers',
    gettransferinfo: 'https://api.mch.weixin.qq.com/mmpaymkttransfers/gettransferinfo',
    sendredpack: 'https://api.mch.weixin.qq.com/mmpaymkttransfers/sendredpack',
    sendgroupredpack: 'https://api.mch.weixin.qq.com/mmpaymkttransfers/sendgroupredpack',
    gethbinfo: 'https://api.mch.weixin.qq.com/mmpaymkttransfers/gethbinfo',
    paybank: 'https://api.mch.weixin.qq.com/mmpaysptrans/pay_bank',
    querybank: 'https://api.mch.weixin.qq.com/mmpaysptrans/query_bank',
    getpublickey: 'https://fraud.mch.weixin.qq.com/risk/getpublickey',
    getsignkey: 'https://api.mch.weixin.qq.com/sandboxnew/pay/getsignkey'
};
class TenpayPlugin extends alaska_payment_1.PaymentPlugin {
    constructor(service) {
        super(service);
        this.init(service);
    }
    init(service) {
        this.service = service;
        service.plugins.set('tenpay', this);
        ['jssdk', 'wxapp', 'native', 'app'].forEach((item) => {
            service.payments.set(`tenpay:${item}`, this);
        });
        this.label = 'Tenpay';
        let configTmp = service.config.get('tenpay');
        if (!configTmp) {
            throw new Error('Tenpay config not found');
        }
        this._config = configTmp;
        this._config = Object.assign({
            appid: '',
            mch_id: '',
            partnerKey: '',
            notify_url: '',
            spbill_create_ip: '127.0.0.1',
            trade_type: 'JSAPI'
        }, this._config);
        let pfxPath = this._config.pfx;
        if (pfxPath) {
            let pfx = fs.readFileSync(pfxPath) || '';
            this._pfx = pfx;
        }
        delete this._config.pfx;
        this._partnerKey = this._config.partnerKey;
        delete this._config.partnerKey;
        this._refund_url = this._config.refund_url;
        delete this._config.refund_url;
    }
    async _parse(xml, type) {
        let json = await utils.parseXML(xml);
        switch (type) {
            case 'middleware_nativePay':
                break;
            default:
                if (json.return_code !== 'SUCCESS')
                    throw new alaska_1.NormalError(json.return_msg || 'XMLDataError');
        }
        switch (type) {
            case 'middleware_refund':
            case 'middleware_nativePay':
            case 'getsignkey':
                break;
            default:
                if (json.result_code !== 'SUCCESS')
                    throw new alaska_1.NormalError(json.err_code || 'XMLDataError');
        }
        switch (type) {
            case 'getsignkey':
                break;
            case 'middleware_refund':
                if (json.appid !== this._config.appid)
                    throw new alaska_1.NormalError('appid不匹配');
                if (json.mch_id !== this._config.mch_id)
                    throw new alaska_1.NormalError('mch_id不匹配');
                json.req_info = await utils.parseXML(utils.decrypt(json.req_info, utils.md5(this._partnerKey).toLowerCase()));
                break;
            case 'transfers':
                if (json.mchid !== this._config.mch_id)
                    throw new alaska_1.NormalError('mchid不匹配');
                break;
            case 'sendredpack':
            case 'sendgroupredpack':
                if (json.wxappid !== this._config.appid)
                    throw new alaska_1.NormalError('wxappid不匹配');
                if (json.mch_id !== this._config.mch_id)
                    throw new alaska_1.NormalError('mchid不匹配');
                break;
            case 'gethbinfo':
            case 'gettransferinfo':
                if (json.mch_id !== this._config.mch_id)
                    throw new alaska_1.NormalError('mchid不匹配');
                break;
            case 'send_coupon':
            case 'query_coupon_stock':
            case 'querycouponsinfo':
                if (json.appid !== this._config.appid)
                    throw new alaska_1.NormalError('appid不匹配');
                if (json.mch_id !== this._config.mch_id)
                    throw new alaska_1.NormalError('mch_id不匹配');
                break;
            case 'getpublickey':
                break;
            case 'paybank':
                if (json.mch_id !== this._config.mch_id)
                    throw new alaska_1.NormalError('mchid不匹配');
                break;
            case 'querybank':
                if (json.mch_id !== this._config.mch_id)
                    throw new alaska_1.NormalError('mchid不匹配');
                break;
            default:
                if (json.appid !== this._config.appid)
                    throw new alaska_1.NormalError('appid不匹配');
                if (json.mch_id !== this._config.mch_id)
                    throw new alaska_1.NormalError('mch_id不匹配');
                if (json.sign !== this._getSign(json, json.sign_type))
                    throw new alaska_1.NormalError('sign签名错误');
        }
        return json;
    }
    async _parseBill(xml, format = false) {
        if (utils.checkXML(xml)) {
            let json = await utils.parseXML(xml);
            throw new Error(json.err_code || json.return_msg || 'XMLDataError');
        }
        if (!format)
            return xml;
        let arr = xml.trim().split(/\r?\n/).filter((item) => item.trim());
        let total_data = arr.pop().substr(1).split(',`');
        let total_title = arr.pop().split(',');
        let list_title = arr.shift().split(',');
        let list_data = arr.map((item) => item.substr(1).split(',`'));
        return { total_title, total_data, list_title, list_data };
    }
    async verify(params) {
        let sign = this._getSign(params);
        return params.sign === sign;
    }
    _getSign(params, type = 'MD5') {
        let str = `${utils.toQueryString(params)}&key=${this._partnerKey}`;
        if (type === 'MD5') {
            return utils.md5(str).toUpperCase();
        }
        if (type === 'SHA256') {
            return utils.sha256(str, this._partnerKey).toUpperCase();
        }
        throw new Error('SignType Error');
    }
    async _request(params, type, cert = false) {
        params.sign = this._getSign(params, params.sign_type);
        let pkg = { method: 'POST', dataType: 'text', data: utils.buildXML(params) };
        if (cert) {
            pkg.pfx = this._pfx;
            pkg.passphrase = this._config.mch_id;
        }
        let { status, data } = await urllib.request(GATEWAY[type], pkg);
        if (status !== 200)
            throw new Error('request fail');
        return ['downloadbill', 'downloadfundflow'].indexOf(type) < 0 ? this._parse(data, type) : data;
    }
    getPublicKey(params) {
        let pkg = {
            mch_id: this._config.mch_id,
            nonce_str: random(16),
            sign_type: params.sign_type || 'MD5'
        };
        return this._request(pkg, 'getpublickey', true);
    }
    unifiedOrder(params) {
        let pkg = Object.assign({}, params, {
            appid: this._config.appid,
            mch_id: this._config.mch_id,
            nonce_str: random(16),
            sign_type: params.sign_type || 'MD5',
            notify_url: params.notify_url || this._config.notify_url,
            spbill_create_ip: params.spbill_create_ip || this._config.spbill_create_ip,
            trade_type: params.trade_type || 'JSAPI'
        });
        return this._request(pkg, 'unifiedorder');
    }
    async getPayParams(params) {
        params.trade_type = params.trade_type || 'JSAPI';
        let order = await this.unifiedOrder(params);
        return this.getPayParamsByPrepay(order);
    }
    getPayParamsByPrepay(params) {
        let pkg = {
            appId: params.sub_appid || this._config.appid,
            timeStamp: String((Date.now() / 1000 | 0)),
            nonceStr: random(16),
            package: `prepay_id=${params.prepay_id}`,
            signType: params.signType || 'MD5'
        };
        pkg.paySign = this._getSign(pkg, pkg.signType);
        pkg.timestamp = pkg.timeStamp;
        return pkg;
    }
    async getAppParams(params) {
        params.trade_type = params.trade_type || 'APP';
        let order = await this.unifiedOrder(params);
        return this.getAppParamsByPrepay(order, params.sign_type);
    }
    getAppParamsByPrepay(params, signType) {
        let pkg = {
            appid: this._config.appid,
            partnerid: this._config.mch_id,
            prepayid: params.prepay_id,
            package: 'Sign=WXPay',
            noncestr: random(16),
            timestamp: String((Date.now() / 1000 | 0))
        };
        pkg.sign = this._getSign(pkg, signType);
        return pkg;
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
    async createParams(payment) {
        const [, channel] = payment.type.split(':');
        let trade_type = this._getTradeType(channel);
        let params = Object.assign({}, this._config, {
            trade_type,
            body: payment.title,
            out_trade_no: String(payment._id),
            total_fee: payment.amount * 100,
        });
        switch (trade_type) {
            case 'NATIVE':
            case 'MWEB':
                return await this.unifiedOrder(params);
            case 'APP':
                return JSON.stringify(await this.getAppParams(params));
            default:
                if (!payment.openid) {
                    throw new Error('openid is required');
                }
                params = Object.assign({}, params, { openid: payment.openid });
                return JSON.stringify(this.getPayParams(params));
        }
    }
    getNativeUrl(params) {
        let pkg = Object.assign({}, params, { appid: this._config.appid, mch_id: this._config.mch_id, time_stamp: String((Date.now() / 1000 | 0)), nonce_str: random(16) });
        let url = `weixin://wxpay/bizpayurl?sign=${this._getSign(pkg)}&appid=${pkg.appid}&mch_id=${pkg.mch_id}&product_id=${encodeURIComponent(pkg.product_id)}&time_stamp=${pkg.time_stamp}&nonce_str=${pkg.nonce_str}`;
        return url;
    }
    _getNativeReply(prepay_id, err_code_des) {
        let pkg = {
            return_code: 'SUCCESS',
            appid: this._config.appid,
            mch_id: this._config.mch_id,
            nonce_str: random(16),
            result_code: 'SUCCESS',
            prepay_id
        };
        if (err_code_des) {
            pkg.result_code = 'FAIL';
            pkg.err_code_des = err_code_des;
        }
        pkg.sign = this._getSign(pkg);
        return utils.buildXML(pkg);
    }
    micropay(params) {
        let pkg = Object.assign({}, params, { appid: this._config.appid, mch_id: this._config.mch_id, nonce_str: random(16), sign_type: params.sign_type || 'MD5', spbill_create_ip: params.spbill_create_ip || this._config.spbill_create_ip });
        return this._request(pkg, 'micropay');
    }
    reverse(params) {
        let pkg = Object.assign({}, params, { appid: this._config.appid, mch_id: this._config.mch_id, nonce_str: random(16), sign_type: params.sign_type || 'MD5' });
        return this._request(pkg, 'reverse', true);
    }
    orderQuery(params) {
        let pkg = Object.assign({}, params, { appid: this._config.appid, mch_id: this._config.mch_id, nonce_str: random(16), sign_type: params.sign_type || 'MD5' });
        return this._request(pkg, 'orderquery');
    }
    closeOrder(params) {
        let pkg = Object.assign({}, params, { appid: this._config.appid, mch_id: this._config.mch_id, nonce_str: random(16), sign_type: params.sign_type || 'MD5' });
        return this._request(pkg, 'closeorder');
    }
    refund(params) {
        let pkg = Object.assign({}, params, { appid: this._config.appid, mch_id: this._config.mch_id, nonce_str: random(16), sign_type: params.sign_type || 'MD5', op_user_id: params.op_user_id || this._config.mch_id, notify_url: params.notify_url || this._refund_url });
        if (!pkg.notify_url)
            delete pkg.notify_url;
        return this._request(pkg, 'refund', true);
    }
    refundQuery(params) {
        let pkg = Object.assign({}, params, { appid: this._config.appid, mch_id: this._config.mch_id, nonce_str: random(16), sign_type: params.sign_type || 'MD5' });
        return this._request(pkg, 'refundquery');
    }
    async downloadBill(params, format = false) {
        let pkg = Object.assign({}, params, { appid: this._config.appid, mch_id: this._config.mch_id, nonce_str: random(16), sign_type: params.sign_type || 'MD5', bill_type: params.bill_type || 'ALL' });
        let xml = await this._request(pkg, 'downloadbill');
        return this._parseBill(xml, format);
    }
    async downloadFundflow(params, format = false) {
        let pkg = Object.assign({}, params, { appid: this._config.appid, mch_id: this._config.mch_id, nonce_str: random(16), sign_type: params.sign_type || 'HMAC-SHA256', account_type: params.account_type || 'Basic' });
        let xml = await this._request(pkg, 'downloadfundflow', true);
        return this._parseBill(xml, format);
    }
    sendCoupon(params) {
        let pkg = Object.assign({}, params, { appid: this._config.appid, mch_id: this._config.mch_id, nonce_str: random(16), openid_count: params.openid_count || 1 });
        return this._request(pkg, 'send_coupon', true);
    }
    queryCouponStock(params) {
        let pkg = Object.assign({}, params, { appid: this._config.appid, mch_id: this._config.mch_id, nonce_str: random(16) });
        return this._request(pkg, 'query_coupon_stock');
    }
    queryCouponInfo(params) {
        let pkg = Object.assign({}, params, { appid: this._config.appid, mch_id: this._config.mch_id, nonce_str: random(16) });
        return this._request(pkg, 'querycouponsinfo');
    }
    transfers(params) {
        let pkg = Object.assign({}, params, { mch_appid: this._config.appid, mchid: this._config.mch_id, nonce_str: random(16), check_name: params.check_name || 'FORCE_CHECK', spbill_create_ip: params.spbill_create_ip || this._config.spbill_create_ip });
        return this._request(pkg, 'transfers', true);
    }
    transfersQuery(params) {
        let pkg = Object.assign({}, params, { appid: this._config.appid, mch_id: this._config.mch_id, nonce_str: random(16) });
        return this._request(pkg, 'gettransferinfo', true);
    }
    async payBank(params) {
        const data = await this.getPublicKey(params);
        const pub_key = data && data.result_code === 'SUCCESS' ? data.pub_key : '';
        if (pub_key === '')
            throw new Error('get publickey fail');
        let pkg = Object.assign({}, params, { mch_id: this._config.mch_id, nonce_str: random(16), enc_bank_no: utils.encryptRSA(pub_key, params.enc_bank_no), enc_true_name: utils.encryptRSA(pub_key, params.enc_true_name) });
        return this._request(pkg, 'paybank', true);
    }
    queryBank(params) {
        let pkg = Object.assign({}, params, { mch_id: this._config.mch_id, nonce_str: random(16) });
        return this._request(pkg, 'querybank', true);
    }
    sendRedpack(params) {
        let pkg = Object.assign({}, params, { wxappid: this._config.appid, mch_id: this._config.mch_id, nonce_str: random(16), client_ip: params.client_ip || this._config.spbill_create_ip, mch_billno: params.mch_billno || (params.mch_autono ? this._config.mch_id + utils.getFullDate() + params.mch_autono : ''), total_num: params.total_num || 1 });
        delete pkg.mch_autono;
        return this._request(pkg, 'sendredpack', true);
    }
    sendGroupRedpack(params) {
        let pkg = Object.assign({}, params, { wxappid: this._config.appid, mch_id: this._config.mch_id, nonce_str: random(16), mch_billno: params.mch_billno || (params.mch_autono ? this._config.mch_id + utils.getFullDate() + params.mch_autono : ''), total_num: params.total_num || 3, amt_type: params.amt_type || 'ALL_RAND' });
        delete pkg.mch_autono;
        return this._request(pkg, 'sendgroupredpack', true);
    }
    redpackQuery(params) {
        let pkg = Object.assign({}, params, { appid: this._config.appid, mch_id: this._config.mch_id, nonce_str: random(16), bill_type: params.bill_type || 'MCHT' });
        return this._request(pkg, 'gethbinfo', true);
    }
}
exports.default = TenpayPlugin;
