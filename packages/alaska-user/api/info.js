'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.chpass = chpass;

var _ = require('../');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//用户信息
exports.default = async function (ctx) {
  if (!ctx.user) {
    _2.default.error(403);
  } else {
    // 已登录
    ctx.body = ctx.user.data('info');
  }
};

//修改密码


async function chpass(ctx) {
  if (ctx.method !== 'POST') {
    _2.default.error(400);
  }

  if (!ctx.user) {
    _2.default.error(403);
  } else {
    // 已登录
    let { password } = ctx.request.body;

    if (!password) {
      _2.default.error('New password is required');
    }

    ctx.user.password = password;
    await ctx.user.save();
    ctx.body = {};
  }
}