// @flow

export default class SmsTestDriver {
  service: Alaska$Service;

  constructor(service: Alaska$Service) {
    this.service = service;
  }

  /**
   * @param {string} to
   * @param {string} message
   * @returns {Promise<Object>}
   */
  send(to: string, message: string): Promise<Object> {
    console.log('send sms to', to, ':', message);
    return Promise.resolve({});
  }
}
