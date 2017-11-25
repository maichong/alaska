'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = create;
exports.show = show;

var _Ticket = require('../models/Ticket');

var _Ticket2 = _interopRequireDefault(_Ticket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function create(ctx) {
  let ticket = new _Ticket2.default(ctx.request.body);
  ticket.sessionId = ctx.sessionId;
  ticket.user = ctx.user;
  await ticket.save();
  ctx.body = {
    id: ticket.id
  };
}

async function show(ctx) {
  let id = ctx.params.id;
  // $Flow findById
  let ticket = await _Ticket2.default.findById(id);

  ctx.body = {
    error: 'Not found'
  };

  if (!ticket || !ticket.verify(ctx)) return;

  ctx.body = ticket.data();
}