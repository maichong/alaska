/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-04-27
 * @author Liang <liang@maichong.it>
 */

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
