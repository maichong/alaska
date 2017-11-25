'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = create;

var _ = require('../');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function create(ctx, next) {
  if (!ctx.user) _2.default.error(403);
  let body = ctx.state.body || ctx.request.body;
  let target = body.target || _2.default.error('missing favorite target');
  let type = body.type || _2.default.error('missing favorite type');
  type = type || '';
  let { title, pic } = body;
  if (!pic || !title) {
    let Model = _2.default.getModel(type);
    // $Flow findById
    let record = await Model.findById(target);
    if (!record) _2.default.error('missing favorite target record');
    let titleField = Model.titleField || '';
    body.title = body.title || record.get(titleField);
    // $Flow avatar 只有user中有 Alaska$Model中不要加avatar
    body.pic = body.pic || record.pic || record.avatar;
  }
  await next();
}