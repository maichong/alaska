// @flow

export default class SmsTestDriver {
  service: Alaska$Service;

  constructor(service: Alaska$Service) {
    this.service = service;
  }

  /**
   * [async] 发送
   * @param to
   * @param message
   * @returns {Promise.<T>}
   */
  send(to: string, message: string): Promise<void> {
    console.log('send sms to', to, ':', message);
    return Promise.resolve();
  }
}
