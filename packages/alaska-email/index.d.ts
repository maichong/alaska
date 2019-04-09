import * as nodemailer from 'nodemailer';
import { Service, DriverConfig, Driver } from 'alaska';
import Email from './models/Email';
import User from 'alaska-user/models/User';
import Send from './sleds/Send';

export interface SendParams {
  email: string | Email;
  to: string | User;
  // TODO:
  locale?: string;
  // template values
  values?: any;
  // driver id
  driver?: string;
  // Email driver options
  options?: nodemailer.SendMailOptions;
}

export class EmailService extends Service {
  models: {
    Email: typeof Email;
  };
  sleds: {
    Send: typeof Send;
  };
  drivers: Map<string, EmailDriver>;
}

declare const emailService: EmailService;

export default emailService;

export interface EamilDriverConfig extends DriverConfig {
  label: string;
}

export class EmailDriver<T=any, C extends EamilDriverConfig=any, D=any> extends Driver<C, D> {
  static readonly classOfEmailDriver = true;
  readonly instanceOfEmailDriver = true;

  send(message: nodemailer.SendMailOptions): Promise<T>;
}
