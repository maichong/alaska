
export default {
  prefix: false,

  services: {
    'alaska-user': {}
  },
  /**
   * 邮件发送驱动
   */
  drivers: {
    test: {
      label: 'Test',
      type: 'alaska-email-test'
    }
  }
};
