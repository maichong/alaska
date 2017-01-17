// @flow

import { Sled } from 'alaska';
import FeedbackComment from '../models/FeedbackComment';

export default class Reply extends Sled {
  /**
   * @param params
   *        params.feedback
   *        params.body
   *        params.admin
   *        [params.ctx]
   */
  async exec(params: {
    feedback:Object,
    user:User,
    admin:User,
    body:Object
  }) {
    let feedback = params.feedback;
    let user = params.user || params.admin;
    let content = params.body.newComment;
    let comment:FeedbackComment = new FeedbackComment({
      user,
      content,
      feedback: feedback._id
    });
    if (params.admin) {
      comment.fromAdmin = true;
    }
    await comment.save();
    feedback.lastComment = comment._id;
    await feedback.save();
  }
}
