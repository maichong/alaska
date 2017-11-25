'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

/**
 * @class TicketService
 */
class TicketService extends _alaska.Service {
  constructor(options) {
    options = options || { dir: '', id: '' };
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-ticket';
    super(options);
  }

  postLoadModels() {
    let service = this;
    const Ticket = service.getModel('Ticket');
    const alaska = service.alaska;
    alaska.post('loadMiddlewares', () => {
      alaska.app.use(async (ctx, next) => {
        if (ctx.method === 'POST') {
          let body = ctx.state.body || ctx.request.body;
          let ticketId = body._ticket || ctx.request.body._ticket;
          if (ticketId) {
            // $Flow
            let ticket = await Ticket.findById(ticketId);
            if (ticket && ticket.verify(ctx)) {
              if (ticket.state) {
                //已经执行完成
                ctx.body = ticket.result;
                return;
              }
              //未执行
              await next();
              ticket.result = ctx.body;
              ticket.state = true;
              await ticket.save();
              return;
            }
          }
        }
        //没有ticket或ticket验证失败,直接执行
        await next();
      });
    });
  }
}

exports.default = new TicketService();