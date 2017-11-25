'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class CaptchaService extends _alaska.Service {
  constructor(options) {
    options = options || { dir: '', id: '' };
    options.id = options.id || 'alaska-captcha';
    options.dir = options.dir || __dirname;
    super(options);
  }

  async preLoadModels() {
    if (_alaska2.default.hasService('alaska-sms')) {
      await _alaska2.default.getService('alaska-sms').loadModels();
    }
    if (_alaska2.default.hasService('alaska-email')) {
      await _alaska2.default.getService('alaska-email').loadModels();
    }
  }

  middleware(toPath) {
    if (!toPath || typeof toPath !== 'string') {
      throw new Error('CaptchaService middleware \'toPath\' error');
    }
    let service = this;
    return async function (ctx, next) {
      let body = ctx.state.body || ctx.request.body;
      let to = body[toPath] || ctx.request.body[toPath];
      let code = body._captcha || ctx.request.body._captcha;
      if (!to || !code) {
        service.error('Invalid captcha');
      }
      let success = await service.run('Verify', { to, code });
      if (!success) {
        service.error('Invalid captcha');
      }
      await next();
    };
  }
}

exports.default = new CaptchaService();