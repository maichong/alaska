// @flow


import { Service } from 'alaska';
/**
 * @class TicketService
 */
class TicketService extends Service {
  constructor(options?:Alaska$Service$options, alaska?:Alaska$Alaska) {
    options = options || {};
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-ticket';
    super(options, alaska);
  }

  postLoadModels() {
    let service = this;
    const Ticket = service.model('Ticket');
    const alaska = service.alaska;
    alaska.post('loadMiddlewares', function () {
      alaska.app.use(async function (ctx:Alaska$Context, next:Function) {
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

export default new TicketService();
