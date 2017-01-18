// @flow

import service from '../';
import Post from '../models/Post';

//修改点击(阅读)次数
export async function show(ctx: Alaska$Context, next: Function) {
  await next();

  //修改点击(阅读)次数
  if (ctx.body && ctx.body.getRecord) {
    // $Flow body.getRecord
    let record: Post = ctx.body.getRecord();
    if (record.isSelected('hots')) {
      record.hots += 1;
      record.save();
    }
  }
}

//获取相关联文章
export async function relations(ctx: Alaska$Context) {
  let postId = ctx.state.post || ctx.query.post;
  if (!postId) service.error(400);
  // $Flow  findById
  let postTarget: ?Post = await Post.findById(postId).populate('relations');
  if (!postTarget) return;
  ctx.body = postTarget.relations.map(
    (post) => post.data().pick('id', 'title', 'pic', 'hots', 'createdAt')
  );
}

