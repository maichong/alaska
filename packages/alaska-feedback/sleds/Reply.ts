import { Sled } from 'alaska-sled';
import { ActionSledParams } from 'alaska-admin';
import Feedback from '../models/Feedback';
import FeedbackComment from '../models/FeedbackComment';

export default class Reply extends Sled<ActionSledParams, Feedback> {
  async exec(params: ActionSledParams): Promise<Feedback> {
    let record = params.record as Feedback;
    let user = params.admin;
    let content = params.body.newComment;
    let comment = new FeedbackComment({
      user,
      content,
      feedback: record._id
    });
    if (params.admin) {
      comment.fromAdmin = true;
    }
    await comment.save({ session: this.dbSession });
    record.lastComment = comment._id;
    await record.save({ session: this.dbSession });
    return record;
  }
}
