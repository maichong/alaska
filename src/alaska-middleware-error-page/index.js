// @flow

/* eslint quote-props:0 */

import alaska, { NormalError } from 'alaska';

export default function (options?: Object) {
  options = options || {
    default: 'error/error',
    '400': 'error/error400',
    '403': 'error/error403',
    '404': 'error/error404',
    '500': 'error/error500'
  };
  return async function errorPageMiddleware(ctx: Alaska$Context, next: Function) {
    try {
      await next();
    } catch (error) {
      ctx.state.pageError = error;
      if (ctx.status === 404) {
        ctx.status = 500;
      }
      if (!(error instanceof NormalError)) {
        //如果不是普通错误,则输出错误信息
        console.error(`${ctx.method} ${ctx.path} -> ${error.message} \n${error.stack}`);
      }
    }

    const { status } = ctx;
    if (status >= 400 && !ctx.body && options) {
      // error page
      const MAIN = alaska.main;
      let page = options[ctx.status] || options.default;
      if (page) {
        let [errorController, errorAction] = page.split('/');
        errorAction = errorAction || 'default';
        // $Flow
        let ctrl = MAIN._controllers[errorController];
        if (ctrl) {
          let act = ctrl[errorAction] || ctrl.default;
          if (act) {
            try {
              await act(ctx, Promise.resolve());
            } catch (error) {
              if (!(error instanceof NormalError)) {
                //如果不是普通错误,则输出错误信息
                console.error(`${ctx.method} ${ctx.path} -> ${error.message} \n${error.stack}`);
              }
            }
            if (status === 404 && ctx.status === 200) {
              ctx.status = 404;
            }
          }
        }
      }
    }
  };
}
