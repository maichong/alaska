// @flow

import ini from 'ini';

const crypto = require('crypto');

export default class SmsAliyunDriver {
  service: Alaska$Service;

  constructor(service: Alaska$Service) {
    this.service = service;
  }

  // /**
  //  * 字典排序
  //  * @param obj
  //  * @return string[]
  //  */
  // dictionarySort(obj:Object): string[] {
  //
  //   //return Object.keys(obj).sort((a,b)=>a>b?1:-1).map((key)=>(`${key}=${obj[key]}`));
  //
  //   let k: string[] = Object.keys(obj);
  //   for (let i = 0; i < k.length; i += 1) {
  //     for (let j = 0; j < k.length; j += 1) {
  //       if (k[i] === k[j]) {
  //         continue;
  //       }
  //       if (k[i].indexOf(k[j]) >= 0 && i < j || k[j].indexOf(k[i]) >= 0 && j < i) {
  //         let temp = k[j];
  //         k[j] = k[i];
  //         k[i] = temp;
  //         continue;
  //       }
  //       let len = k[j].length > k[i].length ? k[i].length : k[j].length;
  //       for (let m = 0; m < len; m += 1) {
  //         if (k[i][m] < k[j][m]) {
  //           let temp = k[j];
  //           k[j] = k[i];
  //           k[i] = temp;
  //         } else if (k[i][m] > k[j][m]) {
  //           break;
  //         }
  //       }
  //     }
  //   }
  //   let res = [];
  //   for (let i = 0; i < k.length; i += 1) {
  //     res.push(k[i] + '=' + obj[k[i]]);
  //   }
  //   return res;
  // }

  utcDate(): string {
    let date = new Date();
    let y = date.getUTCFullYear();
    let m = date.getUTCMonth();
    m = m < 10 ? '0' + m : m;
    let d = date.getUTCDate();
    d = d < 10 ? '0' + d : d;
    let h = date.getUTCHours();
    h = h < 10 ? '0' + h : h;
    let M = date.getUTCMinutes();
    M = M < 10 ? '0' + M : M;
    let s = date.getUTCSeconds();
    s = s < 10 ? '0' + s : s;
    return y + '-' + m + '-' + d + 'T' + h + ':' + M + ':' + s + 'Z';
  }

  /**
   * [async] 发送
   * @param to
   * @param message
   * @returns {Promise.<T>}
   */
  send(to: string, message: string): Promise<void> {
    console.log('send sms to', to, ':', message);
    let config: Object = ini.parse(message);
    let questParam: Object = {
      code: config.params.code,
      product: config.params.product
    };
    console.log('config===', config);
    console.log('config param==', questParam);
    let object: Object = {
      Action: 'SingleSendSms',
      SignName: '脉冲云',
      TemplateCode: config.params.TemplateCode,
      RecNum: to,
      ParamString: JSON.stringify(questParam),
      Format: 'JSON',
      Version: '2016-09-27',
      AccessKeyId: 'LTAIoAkRG4mKCZ81',
      SignatureMethod: 'HMAC-SHA1',
      Timestamp: this.utcDate(),
      SignatureVersion: '1.0',
      SignatureNonce: Math.random() * 100000
    };
    console.log('project==', object);
    let params: string[] = Object.keys(object).sort( // 排序
      (a, b) => (a > b ? 1 : -1)
    ).map(
      (key) => (encodeURI(`${key}=${object[key]}`)) //url编码
    );
    console.log('params==', params);
    let paramsStr = 'GET&%2F&' + params.join('&'); //拼接用于计算签名的字符串
    console.log('paramsStr==', paramsStr);
    let hmac = crypto.createHmac('sha1', '2Tz5gWlneLxuLwhpUWBfqUNPcpouYz').update(paramsStr); // SHA1加密
    console.log('hmac==', hmac);
    let base64 = hmac.digest('base64'); // base64转换
    console.log('base64', base64);
    //Signature
    // let url: string = 'https://sms.aliyuncs.com/?';
    return Promise.resolve();
  }
}
