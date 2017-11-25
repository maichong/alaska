'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.list = list;

var _ = require('../');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//获取文章或者专题评论
async function list(ctx, next) {
  let post = ctx.state.post || ctx.query.post;
  let topic = ctx.state.topic || ctx.query.topic;
  if (!post && !topic) _2.default.error(400);
  let filters = ctx.state.filters || ctx.query.filters || {};
  if (post) {
    filters.post = post;
  } else if (topic) {
    filters.topic = topic;
  }

  ctx.state.filters = filters;
  await next();

  // $Flow 访问body
  let results = ctx.body.results;
  if (results) {
    // $Flow results一定有
    ctx.body.results = results.map(p => {
      if (p.user) {
        p.user = p.user.pick('id', 'username', 'avatar');
      }
      return p;
    });
  }
}