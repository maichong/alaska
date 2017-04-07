// @flow

import { Driver } from 'alaska';
import ini from 'ini';
import moment from 'moment';
import akita from 'akita-node';
import crypto from 'crypto';

const api = akita.resolve('aliyun-sms-dirver');

export default class SmsAliyunDriver extends Driver {
  service: Alaska$Service;

  constructor(service: Alaska$Service, options: Object) {
    super(service, options);
    if (!options.AccessKeyId) throw new Error('Aliyun sms driver init options missing AccessKeyId');
    if (!options.AccessKeySecret) throw new Error('Aliyun sms driver init options missing AccessKeySecret');
    if (!options.SignName) throw new Error('Aliyun sms driver init options missing SignName');
  }


  /**
   * @param {string} to
   * @param {string} message
   * @returns {Promise<Object>}
   */
  async send(to: string, message: string): Promise<Object> {
    let config = ini.parse(message);

    if (!config.TemplateCode) throw new Error('Can not find TemplateCode in sms message content');
    if (!config.params) {
      config.params = {};
    }

    let object = {
      Action: 'SingleSendSms',
      SignName: this.options.SignName,
      TemplateCode: config.TemplateCode,
      RecNum: to,
      ParamString: JSON.stringify(config.params),
      Format: 'JSON',
      Version: '2016-09-27',
      AccessKeyId: this.options.AccessKeyId,
      SignatureMethod: 'HMAC-SHA1',
      Timestamp: moment().toISOString(),
      SignatureVersion: '1.0',
      SignatureNonce: Math.random().toString().substr(2)
    };

    let params = Object.keys(object)
      .sort((a, b) => (a > b ? 1 : -1))
      .map((key) => (`${encodeURIComponent(key)}=${encodeURIComponent(object[key])}`))
      .join('&');

    let stringToSign = 'POST&%2F&' + encodeURIComponent(params);

    let hmac = crypto.createHmac('sha1', this.options.AccessKeySecret + '&');

    hmac.update(stringToSign);

    let sign = hmac.digest('base64');

    return await api.post('https://sms.aliyuncs.com/', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params + '&Signature=' + encodeURIComponent(sign)
    })
  }
}
