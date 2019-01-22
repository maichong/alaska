import IntlMessageFormat from 'intl-messageformat';
import { Sled } from 'alaska-sled';
import service, { SendParams } from '..';
import Sms from '../models/Sms';

const messageCache: { [key: string]: IntlMessageFormat } = {};

export default class Send extends Sled<SendParams, void> {
  /**
   * 发送短信
   */
  async exec(params: SendParams) {
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
