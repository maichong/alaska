"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const fs = require("fs");
const crypto = require("crypto");
const moment = require("moment");
const akita_1 = require("akita");
const alaska_withdraw_1 = require("alaska-withdraw");
const Withdraw_1 = require("alaska-withdraw/models/Withdraw");
const alaska_1 = require("alaska");
const client = akita_1.default.create({});
const GATEWAY = 'https://openapi.alipay.com/gateway.do';
class AlipayWithdrawPlugin extends alaska_withdraw_1.WithdrawPlugin {
    constructor(pluginConfig, service) {
        super(pluginConfig, service);
        if (_.isEmpty(pluginConfig.channels))
            throw new Error(`Missing config [alaska-withdraw/plugins.alaska-withdraw-alipay.channels]`);
        this.configs = new Map();
        for (let key of _.keys(pluginConfig.channels)) {
            let config = pluginConfig.channels[key];
            ['app_id', 'private_key'].forEach((k) => {
                if (!config[k])
                    throw new Error(`Missing config [alaska-withdraw/plugins.alaska-withdraw-alipay.${key}.${k}]`);
            });
            if (typeof config.private_key === 'string') {
                config.private_key = fs.readFileSync(config.private_key);
            }
            let type = `alipay:${key}`;
            this.configs.set(type, config);
            service.withdrawPlugins.set(type, this);
            if (!_.find(Withdraw_1.default.fields.type.options, (opt) => opt.value === type)) {
                Withdraw_1.default.fields.type.options.push({
                    label: config.label || 'Alipay',
                    value: type
                });
            }
        }
    }
    async withdraw(withdraw) {
        const config = this.configs.get(withdraw.type);
        if (!config)
            throw new Error('Unsupported alipay withdraw type!');
        if (withdraw.currency && config.currency && withdraw.currency !== config.currency)
            throw new Error('Currency not match!');
        let params = {
            app_id: config.app_id,
            method: 'alipay.fund.trans.toaccount.transfer',
            charset: 'utf-8',
            sign_type: config.sign_type || 'RSA2',
            timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
            version: '1.0',
            biz_content: _.assign({
                out_biz_no: withdraw.id,
                payee_type: withdraw.alipayId ? 'ALIPAY_USERID' : 'ALIPAY_LOGONID',
                payee_account: withdraw.alipayId ? withdraw.alipayId : withdraw.alipay,
                payee_real_name: withdraw.realName || '',
                amount: withdraw.amount,
                remark: withdraw.remark,
            }, config.biz_content)
        };
        let queryString = this.createQueryString(this.paramsFilter(params));
        let signer = crypto.createSign(config.sign_type === 'RSA' ? 'RSA-SHA1' : 'RSA-SHA256');
        signer.update(queryString, 'utf8');
        params.sign = signer.sign(config.private_key, 'base64');
        let url = `${GATEWAY}?${this.createQueryStringUrlencode(params)}`;
        let { alipay_fund_trans_toaccount_transfer_response: res } = await client.post(url);
        if (res.msg !== 'Success')
            throw new alaska_1.NormalError(res.sub_msg);
        withdraw.alipayOrderId = res.order_id;
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
exports.default = AlipayWithdrawPlugin;
