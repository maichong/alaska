declare module 'alaska-ticket' {
  declare class TicketService extends Alaska$Service {
  constructor(options?:Alaska$Service$options, alaska?:Alaska$Alaska):void;
  }
  declare var exports: TicketService;
}

declare module 'alaska-ticket/models/Ticket' {
  declare class Ticket extends Alaska$Model {
  user: ?User;
  title: string;
  userId: string;
  sessionId: string;
  state: Object;
  result: Object;
  createdAt: Date;
  preSave(): void;
  verify(ctx: Alaska$Context): boolean;
  }
  declare var exports: Class<Ticket>;
}
