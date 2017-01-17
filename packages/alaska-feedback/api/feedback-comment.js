// @flow

import Feedback from '../models/Feedback';

export async function create(ctx: Alaska$Context, next: Function) {
  let body = ctx.state.body || ctx.request.body;
  let fid = body.feedback || ctx.request.body.feedback || ctx.service.error('Missing feedback id');
  // $Flow
  let feedback: Feedback = await Feedback.findById(fid);
  if (!feedback) ctx.service.error('Cannot find feedback');
  if (feedback.user && ctx.user && feedback.user.toString() === ctx.user ? ctx.user._id.toString() : '') {
    await next();
    if (ctx.body && ctx.body.id) {
      feedback.updatedAt = new Date();
      feedback.lastComment = ctx.body.id;
      feedback.save();
    }
  } else {
    ctx.service.error('Cannot find feedback.');
  }
}
