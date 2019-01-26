import * as nodemailer from 'nodemailer';
import { Service } from 'alaska';
import { EmailDriver } from 'alaska-email';
import { EmailSmtpDriverOptions } from '.';

export default class EmailSmtpDriver extends EmailDriver<nodemailer.SentMessageInfo, EmailSmtpDriverOptions, nodemailer.Transporter> {
  constructor(options: EmailSmtpDriverOptions, service: Service) {
    super(options, service);
    this._driver = nodemailer.createTransport(options.smtp);
  }

  async send(data: nodemailer.SendMailOptions): Promise<nodemailer.SentMessageInfo> {
    return this._driver.sendMail(data);
  }
}
