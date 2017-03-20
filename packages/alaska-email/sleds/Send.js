// @flow

import alaska, { Sled } from 'alaska';
import service from '../';
import Email from '../models/Email';

export default class Send extends Sled {
  /**
   * 发送邮件
   * @param params
   *        params.email 邮件模板ID或记录
   *        params.to 目标邮件地址或用户
   *        [params.locale] 邮件采用的语言
   *        [params.driver] 驱动,如果不指定,params.email记录中指定的驱动或默认驱动
   *        [params.values] Email内容中填充的数据
   *        [params.options] 其他发送选项
   */
  async exec(params: {
    email:string|Email;
    to:string|User;
    locale?:string;
    driver?:string;
    values?:Object;
    options?:Object;
  }): Promise<Object> {
    let driver = params.driver;
    let to = params.to;
    if (driver && typeof driver === 'string') {
      driver = service.driversMap[driver];
    }
    let email = params.email;
    if (email && typeof email === 'string') {
      // $Flow
      let emailTmp: Email = await Email.findById(email);
      email = emailTmp;
    }
    if (!email) alaska.panic('Can not find email');

    if (!driver) {
      if (email && email.driver) {
        driver = service.driversMap[email.driver];
      }
      if (!driver) {
        driver = service.defaultDriver;
      }
    }

    if (to && typeof to === 'object' && !Array.isArray(to) && to.email) {
      // $Flow
      let user: User = to;
      if (user.displayName) {
        to = `"${user.displayName}" <${user.email}>`;
      } else {
        to = user.email;
      }
    }

    let renderer = service.renderer;

    // $Flow
    let content = renderer.render(email.content, params.values || {});

    return await driver.send(Object.assign({
      to,
      // $Flow
      subject: email.subject,
      html: content
    }, params.options));
  }
}
