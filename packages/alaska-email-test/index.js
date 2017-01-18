// @flow

export default class EmailTestDriver {
  service: Alaska$Service;
  options: Object;

  constructor(service: Alaska$Service, options: Object) {
    this.service = service;
    this.options = options;
  }

  /**
   * [async] 发送
   * @param data nodemailer e-mail message fields
   */
  send(data: Object) {
    console.log('send email', data);
    return Promise.resolve();
  }
};
