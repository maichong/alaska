import * as nodemailer from 'nodemailer';
import * as SMTPConnection from 'nodemailer/lib/smtp-connection';
import { EmailDriver, EamilDriverOptions } from 'alaska-email';

export interface EmailSmtpDriverOptions extends EamilDriverOptions {
  smtp: SMTPConnection.Options;
}

export default class EmailSmtpDriver extends EmailDriver<nodemailer.SentMessageInfo, EmailSmtpDriverOptions, nodemailer.Transporter> {
}
