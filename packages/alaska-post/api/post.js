'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.show = show;
exports.relations = relations;

var _ = require('../');

var _2 = _interopRequireDefault(_);

var _Post = require('../models/Post');

var _Post2 = _interopRequireDefault(_Post);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//修改点击(阅读)次数
async function show(ctx, next) {
  await next();

  //修改点击(阅读)次数
  if (ctx.body && ctx.body.getRecord) {
    // $Flow body.getRecord
    let record = ctx.body.getRecord();
    if (record.isSelected('hots')) {
      record.hots += 1;
      record.save();
    }
  }
}

//获取相关联文章
async function relations(ctx) {
  let postId = ctx.state.post || ctx.query.post;
  if (!postId) _2.default.error(400);
  // $Flow  findById
  let postTarget = await _Post2.default.findById(postId).populate('relations');
  if (!postTarget) return;
  ctx.body = postTarget.relations.map(post => post.data().pick('id', 'title', 'pic', 'hots', 'createdAt'));
}