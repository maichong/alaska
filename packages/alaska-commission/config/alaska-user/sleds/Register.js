'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pre = pre;

var _alaska = require('alaska');

var _User = require('alaska-user/models/User');

var _User2 = _interopRequireDefault(_User);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//flow

async function pre() {
  let ctx = this.params.ctx;
  let user = this.params.user;
  if (this.params.promoter || !ctx || user && user.promoter) return;
  let promoter = ctx.cookies.get('promoter');
  if (!promoter && !_alaska.utils.isObjectId(promoter)) return;
  // $Flow findById
  promoter = await _User2.default.findById(promoter);
  if (promoter) {
    this.params.promoter = promoter._id;
    if (user) {
      user.promoter = promoter._id;
    }
  }
}