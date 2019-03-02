import { Sled } from 'alaska-sled';
import * as nunjucks from 'nunjucks';
import Email from '../models/Email';
import emailService, { SendParams, EmailDriver } from '..';

export default class Send extends Sled<SendParams, void> {
  async exec(params: SendParams) {
    let email: Email;
    let driver: EmailDriver = emailService.drivers.get('default');
    let to = params.to;

    if (params.email) {
      if (typeof params.email === 'string') {
        email = await Email.findById(email);
      } else {
        email = params.email;
      }
    }
    if (!email) throw new Error('Can not find email');

    if (params.driver && typeof params.driver === 'string') {
      driver = emailService.drivers.get(params.driver);
    } else if (email.driver) {
      driver = emailService.drivers.get(email.driver);
    }
    if (!driver) {
      throw new Error('Email driver not found!');
    }

    if (to && typeof to === 'object' && to.email) {
      let user = to;
      if (user.displayName) {
        to = `"${user.displayName}" <${user.email}>`;
      } else {
        to = user.email;
      }
    }

    let content = nunjucks.renderString(email.content, params.values || {});

    return await driver.send(Object.assign({
      to,
      subject: email.subject,
      html: content
    }, params.options));
  }
}
