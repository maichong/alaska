// @flow

import alaska, { Service } from 'alaska';

class CaptchaService extends Service {
  constructor(options?: Alaska$Service$options) {
    options = options || { dir: '', id: '' };
    options.id = options.id || 'alaska-captcha';
    options.dir = options.dir || __dirname;
    super(options);
  }

  async preLoadModels() {
    if (alaska.hasService('alaska-sms')) {
      await alaska.getService('alaska-sms').loadModels();
    }
    if (alaska.hasService('alaska-email')) {
      await alaska.getService('alaska-email').loadModels();
    }
  }

  middleware(toPath: ?string): Function {
    if (!toPath || typeof toPath !== 'string') {
      throw new Error('CaptchaService middleware \'toPath\' error');
    }
    let service = this;
    return async function (ctx: Alaska$Context, next: Function) {
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

export default new CaptchaService();
