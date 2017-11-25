'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _FeedbackComment = require('../models/FeedbackComment');

var _FeedbackComment2 = _interopRequireDefault(_FeedbackComment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Reply extends _alaska.Sled {
  /**
   * @param params
   *        params.feedback
   *        params.body
   *        params.admin
   *        [params.ctx]
   */
  async exec(params) {
    let feedback = params.feedback;
    let user = params.user || params.admin;
    let content = params.body.newComment;
    let comment = new _FeedbackComment2.default({
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
exports.default = Reply;