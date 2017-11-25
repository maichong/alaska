'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  prefix: false,
  /**
   * 短信发送驱动
   */
  drivers: {
    test: {
      label: 'Test',
      type: 'alaska-sms-test'
    }
  },
  /**
   * 短信签名,例如 【脉冲软件】
   */
  sign: ''
};