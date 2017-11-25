'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = create;

var _Feedback = require('../models/Feedback');

var _Feedback2 = _interopRequireDefault(_Feedback);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function create(ctx, next) {
  let body = ctx.state.body || ctx.request.body;
  let fid = body.feedback || ctx.request.body.feedback || ctx.service.error('Missing feedback id');
  // $Flow
  let feedback = await _Feedback2.default.findById(fid);
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