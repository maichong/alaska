'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _ = require('../');

var _2 = _interopRequireDefault(_);

var _Upload = require('../sleds/Upload');

var _Upload2 = _interopRequireDefault(_Upload);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = async function (ctx) {
  if (ctx.method !== 'POST') _2.default.error(400);
  let auth = _2.default.getConfig('auth');
  if (auth && !ctx.user) _2.default.error(403);
  let body = ctx.state.body || ctx.request.body;
  let file;
  if (ctx.files) {
    file = ctx.files.file;
  }

  let image = await _Upload2.default.run(_extends({
    user: ctx.user,
    file
  }, body));

  ctx.body = image.pic;
};