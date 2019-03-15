import { Service } from 'alaska';
import * as ini from 'ini';
import * as moment from 'moment';
import akita from 'akita';
import * as crypto from 'crypto';
import SmsDriver from 'alaska-sms/driver';
import { SmsAliyunOptions } from '.';

const api = akita.resolve('aliyun-sms-driver');

export default class SmsAliyunDriver<T> extends SmsDriver<T, SmsAliyunOptions, null> {

  constructor(options: SmsAliyunOptions, service: Service) {
    super(options, service);
  }

  /**
   * @param {string} to
   * @param {string} message
   * @returns {Promise<T>}
   */
  async send(to: string, message: string): Promise<T> {
    let config = ini.parse(message);
    if (!config.TemplateCode) throw new Error('Can not find TemplateCode in sms message content');
    if (!config.params) {
      config.params = {};
    }
    let object: { [key: string]: any } = {
      RegionId: 'cn-hangzhou',
      Action: 'SendSms',
      SignName: config.SignName || this.options.SignName,
      TemplateCode: config.TemplateCode,
      PhoneNumbers: to,
      TemplateParam: JSON.stringify(config.params), //不能包含中文,只能[0-9][A-Z][a-z]
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
