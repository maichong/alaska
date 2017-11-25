'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.paginate = paginate;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _User = require('alaska-user/models/User');

var _User2 = _interopRequireDefault(_User);

var _2 = require('../');

var _3 = _interopRequireDefault(_2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function paginate(ctx) {
  // $Flow
  let user = ctx.user || _3.default.error(403);
  // $Flow
  let res = await _User2.default.paginate().where(_lodash2.default.assign({ promoter: user._id }, ctx.state.filters)).page(parseInt(ctx.state.page || ctx.query._page) || 1).limit(parseInt(ctx.state.limit || ctx.query._limit) || 10);

  ctx.body = res;
  // $Flow results 查询返回结果，类型不定 line 19
  ctx.body.results = _lodash2.default.map(res.results, u => u.data(ctx.state.scope || 'tiny'));
}