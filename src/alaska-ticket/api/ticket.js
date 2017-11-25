// @flow

import Ticket from '../models/Ticket';

export async function create(ctx: Alaska$Context) {
  let ticket = new Ticket(ctx.request.body);
  ticket.sessionId = ctx.sessionId;
  ticket.user = ctx.user;
  await ticket.save();
  ctx.body = {
    id: ticket.id
  };
}

export async function show(ctx: Alaska$Context) {
  let id = ctx.params.id;
  // $Flow findById
  let ticket: Ticket = await Ticket.findById(id);

  ctx.body = {
    error: 'Not found'
  };

  if (!ticket || !ticket.verify(ctx)) return;

  ctx.body = ticket.data();
}
