import * as _ from 'lodash';
import * as minimatch from 'minimatch';
import { MainService, NormalError } from 'alaska';
import {
  CaptchaMiddlewareOptions,
} from 'alaska-middleware-captcha';
import Captcha from 'alaska-captcha';
import { Context } from 'alaska-http';
import { Middleware } from 'koa';

export default function (options: CaptchaMiddlewareOptions, main: MainService): Middleware {
  return async function (ctx: Context, next: Function): Promise<void> {
    if (!main.services || !main.services['alaska-captcha']) {
      await next();
      return;
    }
    if (!options || !options.paths || !_.isObject(options.paths)) {
      throw new Error('CaptchaService middleware \'paths\' error');
    }
    let paths = _.keys(options.paths);//获取keys为paths
    if (!paths.length) throw new Error('CaptchaService middleware \'paths\' can not empty');
    let path = _.find(paths, (item) => minimatch(ctx.url, item));
    if (!path) {
      await next();
      return;
    }
    let params = options.paths[path]; //配置参数
    if (!params || !params.to || typeof params.to !== 'string') {
      throw new Error('CaptchaService middleware \'to\' of paths error');
    }
    let stateBody = ctx.state.body || {};
    let requestBody: any = ctx.request.body || {};
    let to: number = stateBody[params.to] || requestBody[params.to];
    let code = stateBody[params.captcha || 'captcha'] || requestBody[params.captcha || 'captcha'];
    if (!to || !code) {
      Captcha.error('Invalid captcha');
    }
    let success = await Captcha.run('Verify', { to, code });
    if (!success) {
      Captcha.error('Invalid captcha');
    }
    await next();
  };
}
