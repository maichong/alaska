import * as nodemailer from 'nodemailer';
import * as SMTPConnection from 'nodemailer/lib/smtp-connection';
import { EmailDriver, EamilDriverConfig } from 'alaska-email';

export interface EmailSmtpDriverConfig extends EamilDriverConfig {
  smtp: SMTPConnection.Options;
}

export default class EmailSmtpDriver extends EmailDriver<nodemailer.SentMessageInfo, EmailSmtpDriverConfig, nodemailer.Transporter> {
}
