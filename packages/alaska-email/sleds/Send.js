'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

var _ = require('../');

var _2 = _interopRequireDefault(_);

var _Email = require('../models/Email');

var _Email2 = _interopRequireDefault(_Email);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Send extends _alaska.Sled {
  /**
   * 发送邮件
   * @param params
   *        params.email 邮件模板ID或记录
   *        params.to 目标邮件地址或用户
   *        [params.locale] 邮件采用的语言
   *        [params.driver] 驱动,如果不指定,params.email记录中指定的驱动或默认驱动
   *        [params.values] Email内容中填充的数据
   *        [params.options] 其他发送选项
   */
  async exec(params) {
    let driver = params.driver;
    let to = params.to;
    if (driver && typeof driver === 'string') {
      driver = _2.default.driversMap[driver];
    }
    let email = params.email;
    if (email && typeof email === 'string') {
      // $Flow
      let emailTmp = await _Email2.default.findById(email);
      email = emailTmp;
    }
    if (!email) _alaska2.default.panic('Can not find email');

    if (!driver) {
      if (email && email.driver) {
        driver = _2.default.driversMap[email.driver];
      }
      if (!driver) {
        driver = _2.default.defaultDriver;
      }
    }

    if (to && typeof to === 'object' && !Array.isArray(to) && to.email) {
      let user = to;
      if (user.displayName) {
        to = `"${user.displayName}" <${user.email}>`;
      } else {
        to = user.email;
      }
    }

    let renderer = _2.default.renderer;

    // $Flow
    let content = renderer.render(email.content, params.values || {});

    return await driver.send(Object.assign({
      to,
      // $Flow
      subject: email.subject,
      html: content
    }, params.options));
  }
}
exports.default = Send;