'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (options) {
  options = options || {
    default: 'error/error',
    '400': 'error/error400',
    '403': 'error/error403',
    '404': 'error/error404',
    '500': 'error/error500'
  };
  return async function errorPageMiddleware(ctx, next) {
    try {
      await next();
    } catch (error) {
      ctx.state.pageError = error;
      if (ctx.status === 404) {
        ctx.status = 500;
      }
      if (!(error instanceof _alaska.NormalError)) {
        //如果不是普通错误,则输出错误信息
        console.error(`${ctx.method} ${ctx.path} -> ${error.message} \n${error.stack}`);
      }
    }

    const { status } = ctx;
    if (status >= 400 && !ctx.body && options) {
      // error page
      const MAIN = _alaska2.default.main;
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
              if (!(error instanceof _alaska.NormalError)) {
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
};

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }