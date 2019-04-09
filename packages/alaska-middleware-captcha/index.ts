import * as _ from 'lodash';
import * as minimatch from 'minimatch';
import { MainService } from 'alaska';
import captchaService from 'alaska-captcha';
import Verify from 'alaska-captcha/sleds/Verify';
import { Context } from 'alaska-http';
import { Middleware } from 'koa';
import { CaptchaMiddlewareConfig } from '.';

export default function (config: CaptchaMiddlewareConfig, main: MainService): Middleware {
  if (!config || !config.paths || !_.isObject(config.paths)) {
    throw new Error('CaptchaService middleware \'paths\' error');
  }
  // 获取keys为paths
  let paths = _.keys(config.paths);
  if (!paths.length) throw new Error('CaptchaService middleware \'paths\' can not empty');
  _.forEach(config.paths, (info, path) => {
    if (!info.id) throw new Error(`Missing config [/middlewares.alaska-middleware-captcha.paths[${path}].id]`);
    if (!info.to) throw new Error(`Missing config [/middlewares.alaska-middleware-captcha.paths[${path}].to]`);
  });
  return async function (ctx: Context, next: Function): Promise<void> {
    if (!main.lookup('alaska-captcha')) {
      await next();
      return;
    }
    let path = _.find(paths, (item) => minimatch(ctx.path, item));
    if (!path) {
      await next();
      return;
    }
    ctx.state.jsonApi = true;
    let params = config.paths[path]; // 配置参数
    let stateBody = ctx.state.body || {};
    let requestBody: any = ctx.request.body || {};
    let to: string = stateBody[params.to] || requestBody[params.to];
    let code = stateBody[params.captcha || 'captcha'] || requestBody[params.captcha || 'captcha'];
    if (!code) {
      captchaService.error('Invalid captcha', 400);
    }
    let success = await Verify.run({ id: params.id, to, code, user: ctx.user }, { dbSession: ctx.dbSession });
    if (!success) {
      captchaService.error('Invalid captcha', 400);
    }
    await next();
  };
}
