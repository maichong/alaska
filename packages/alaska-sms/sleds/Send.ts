import IntlMessageFormat from 'intl-messageformat';
import { Sled } from 'alaska-sled';
import service, { SmsDriver } from '..';
import Sms from '../models/Sms';

const messageCache: { [key: string]: IntlMessageFormat } = {};

export default class Send extends Sled<{}, void> {
  /**
   * 发送短信
   * @param params
   *        params.sms 短信模板ID或记录
   *        params.to 目标手机号
   *        [params.message] 短信内容,如果有此值,则忽略params.sms
   *        [params.locale] 短信采用的语言
   *        [params.driver] 驱动,如果不指定,则采用params.sms记录中指定的驱动或默认驱动
   *        [params.values] 短信内容中填充的数据
   */
  async exec(params: {
    sms: string | Sms;
    to: string;
    message: string;
    driver: void | SmsDriver<any, any>;
    locale: string;
    values: string;
  }) {
    let message = params.message;
    let driver = params.driver;
    let to = params.to;
    if (driver && typeof driver === 'string') {
      driver = service.driversMap[driver];
    }
    if (driver && to && message) {
      return await driver.send(to, message);
    }
    let smsModel: Sms = null;
    if (params.sms && typeof params.sms === 'string') {
      let s: Sms = await Sms.findById(params.sms);
      smsModel = s;
    } else {
      smsModel = params.sms as Sms || null;
    }
    if (!message) {
      if (!smsModel) throw new Error('Can not find sms');
      message = smsModel.content;
      // if (params.locale) {
      //   //定义了语言
      //   let field: string = 'content_' + params.locale.replace('-', '_');
      //   if (smsModel[field]) {
      //     message = smsModel[field];
      //   }
      // }
    }

    if (!driver) {
      if (smsModel && smsModel.driver) {
        driver = service.driversMap[smsModel.driver];
      }
      if (!driver) {
        driver = service.defaultDriver;
      }
    }
    let values = params.values;
    if (values) {
      if (!messageCache[message]) {
        messageCache[message] = new IntlMessageFormat(message, '');
      }
      message = messageCache[message].format(values);
    }
    if (!driver) throw new Error('Can not resolve sms driver!');
    return await driver.send(to, message);
  }
}
