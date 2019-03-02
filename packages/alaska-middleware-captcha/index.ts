import * as _ from 'lodash';
import * as minimatch from 'minimatch';
import { MainService } from 'alaska';
import captchaService from 'alaska-captcha';
import Verify from 'alaska-captcha/sleds/Verify';
import { Context } from 'alaska-http';
import { Middleware } from 'koa';
import { CaptchaMiddlewareOptions } from '.';

export default function (options: CaptchaMiddlewareOptions, main: MainService): Middleware {
  if (!options || !options.paths || !_.isObject(options.paths)) {
    throw new Error('CaptchaService middleware \'paths\' error');
  }
  // 获取keys为paths
  let paths = _.keys(options.paths);
  if (!paths.length) throw new Error('CaptchaService middleware \'paths\' can not empty');
  return async function (ctx: Context, next: Function): Promise<void> {
    if (!main.allServices.get('alaska-captcha')) {
      await next();
      return;
    }
    let path = _.find(paths, (item) => minimatch(ctx.path, item));
    if (!path) {
      await next();
      return;
    }
    ctx.state.jsonApi = true;
    let params = options.paths[path]; // 配置参数
    if (!params || !params.to || typeof params.to !== 'string') {
      throw new Error('CaptchaService middleware \'to\' of paths error');
    }
    let stateBody = ctx.state.body || {};
    let requestBody: any = ctx.request.body || {};
    let to: string = stateBody[params.to] || requestBody[params.to];
    let code = stateBody[params.captcha || 'captcha'] || requestBody[params.captcha || 'captcha'];
    if (!to || !code) {
      captchaService.error('Invalid captcha');
    }
    let success = await Verify.run({ to, code });
    if (!success) {
      captchaService.error('Invalid captcha');
    }
    await next();
  };
}
