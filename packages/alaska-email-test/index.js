// @flow

exports.default = class EmailTestDriver {
  service: Alaska$Service;
  options: Alaska$Service$options;

  constructor(service: Alaska$Service, options: Alaska$Service$options) {
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
