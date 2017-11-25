'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (router) {
  let superMode = _2.default.getConfig('superMode');
  if (typeof superMode === 'string') {
    superMode = {
      cookie: superMode
    };
  }
  router.use((ctx, next) => {
    ctx.state.superMode = false;
    if (superMode === true) {
      ctx.state.superMode = true;
    } else if (superMode) {
      if (superMode.cookie && ctx.cookies.get(superMode.cookie)) {
        ctx.state.superMode = true;
      } else if (ctx.user) {
        if (superMode.userId && superMode.userId === ctx.user.id) {
          ctx.state.superMode = true;
        } else if (superMode.username && superMode.username === ctx.user.username) {
          ctx.state.superMode = true;
        }
      }
    }
    return next();
  });
};

var _ = require('../');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }