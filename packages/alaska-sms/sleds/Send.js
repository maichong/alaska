// @flow

import IntlMessageFormat from 'intl-messageformat';
import alaska, { Sled } from 'alaska';
import service from '../';
import Sms from '../models/Sms';

const messageCache = {};

export default class Send extends Sled {
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
    sms:Object,
    to:string,
    message:string,
    driver:string|Object,
    locale:string,
    values:string
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
    let sms = params.sms;
    if (sms && typeof sms === 'string') {
      // $Flow
      let s:Sms = await Sms.findById(sms);
      sms = s;
    }
    if (!message) {
      if (!sms) alaska.panic('Can not find sms');
      message = sms.content;
      if (params.locale) {
        //定义了语言
        let field = 'content_' + params.locale.replace('-', '_');
        if (sms[field]) {
          message = sms[field];
        }
      }
    }

    if (!driver) {
      if (sms && sms.driver) {
        driver = service.driversMap[sms.driver];
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

    return await driver.send(to, message);
  }
}
