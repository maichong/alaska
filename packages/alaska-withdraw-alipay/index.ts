import * as _ from 'lodash';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as moment from 'moment';
import akita from 'akita';
import { WithdrawService, WithdrawPlugin } from 'alaska-withdraw';
import Withdraw from 'alaska-withdraw/models/Withdraw';
import { ObjectMap, NormalError } from 'alaska';
import { AlipayWithdrawPluginConfig, AlipayWithdrawConfig } from '.';

const client = akita.create({});
const GATEWAY = 'https://openapi.alipay.com/gateway.do';

export default class AlipayWithdrawPlugin extends WithdrawPlugin<AlipayWithdrawPluginConfig> {
  service: WithdrawService;
  configs: Map<string, AlipayWithdrawConfig>;

  constructor(pluginConfig: AlipayWithdrawPluginConfig, service: WithdrawService) {
    super(pluginConfig, service);
    if (_.isEmpty(pluginConfig.channels)) throw new Error(`Missing config [alaska-withdraw/plugins.alaska-withdraw-alipay.channels]`);

    this.configs = new Map();
    for (let key of _.keys(pluginConfig.channels)) {
      let config: AlipayWithdrawConfig = pluginConfig.channels[key];
      ['app_id', 'private_key'].forEach((k) => {
        // @ts-ignore index
        if (!config[k]) throw new Error(`Missing config [alaska-withdraw/plugins.alaska-withdraw-alipay.${key}.${k}]`);
      });
      if (typeof config.private_key === 'string') {
        config.private_key = fs.readFileSync(config.private_key);
      }
      let type = `alipay:${key}`;

      this.configs.set(type, config);
      service.withdrawPlugins.set(type, this);

      if (!_.find(Withdraw.fields.type.options, (opt) => opt.value === type)) {
        Withdraw.fields.type.options.push({
          label: config.label || 'Alipay',
          value: type
        });
      }
    }
  }

  async withdraw(withdraw: Withdraw): Promise<void> {
    const config = this.configs.get(withdraw.type);
    if (!config) throw new Error('Unsupported alipay withdraw type!');
    if (withdraw.currency && config.currency && withdraw.currency !== config.currency) throw new Error('Currency not match!');

    let params: any = {
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

    if (res.msg !== 'Success') throw new NormalError(res.sub_msg);

    withdraw.alipayOrderId = res.order_id;
  }

  /**
  * 除去数组中的空值和签名参数
  * @param params 签名参数组
  * @return {object} 去掉空值与签名参数后的新签名参数组
  */
  private paramsFilter(params: ObjectMap<any>): ObjectMap<any> {
    return _.reduce(params, (result: ObjectMap<any>, value, key) => {
      if (value && key !== 'sign') {
        result[key] = value;
      }
      return result;
    }, {});
  }

  /**
   * 把数组所有元素，按照“参数=参数值”的模式用“&”字符拼接成字符串
   * @param params
   * @returns {string}
   */
  private createQueryString(params: ObjectMap<any>): string {
    return _.keys(params).sort().map((key) => {
      let value = params[key];
      if (_.isPlainObject(value)) {
        value = JSON.stringify(value);
      }
      return `${key}=${value}`;
    }).join('&');
  }

  private createQueryStringUrlencode(params: ObjectMap<any>): string {
    return _.keys(params).sort().map((key) => {
      let value = params[key];
      if (_.isPlainObject(value)) {
        value = JSON.stringify(value);
      }
      return `${key}=${encodeURIComponent(value)}`;
    }).join('&');
  }
}
