import { EmailDriver } from 'alaska-email';

export default class EmailTestDriver extends EmailDriver {
  send(message: any): Promise<{}> {
    console.log('send email', message);
    return Promise.resolve({});
  }
}
