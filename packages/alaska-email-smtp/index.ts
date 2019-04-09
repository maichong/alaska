import * as nodemailer from 'nodemailer';
import { Service } from 'alaska';
import { EmailDriver } from 'alaska-email';
import { EmailSmtpDriverConfig } from '.';

export default class EmailSmtpDriver extends EmailDriver<nodemailer.SentMessageInfo, EmailSmtpDriverConfig, nodemailer.Transporter> {
  constructor(config: EmailSmtpDriverConfig, service: Service) {
    super(config, service);
    this._driver = nodemailer.createTransport(config.smtp);
  }

  async send(data: nodemailer.SendMailOptions): Promise<nodemailer.SentMessageInfo> {
    return this._driver.sendMail(data);
  }
}
