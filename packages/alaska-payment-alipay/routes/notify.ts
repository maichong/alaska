import { Context, Router } from 'alaska-http';
import paymentService from 'alaska-payment';
import Payment from 'alaska-payment/models/Payment';
import Complete from 'alaska-payment/sleds/Complete';

export default function (router: Router) {
  /**
   * 创建记录
   */
  router.post('/notify/alipay', async (ctx: Context) => {
    ctx.status = 400;
    ctx.body = 'ERR';
    if (ctx.method !== 'POST') return;
    let body = ctx.state.body || ctx.request.body;
    if (!body || body.trade_status !== 'TRADE_SUCCESS') return;

    let paymentId = body.out_trade_no;

    let payment = (await Payment.findById(paymentId).session(ctx.dbSession)) as Payment;
    if (!payment) return;

    if (payment.state !== 'pending') return;

    let plugin = paymentService.paymentPlugins.get(payment.type);

    if (!await plugin.verify(body, payment)) return;

    payment.callbackData = body;
    payment.alipayTradeNo = body.trade_no;
    payment.alipayBuyerId = body.buyer_id;
    payment.alipayBuyerLogonId = body.buyer_logon_id;

    await Complete.run({ record: payment }, { dbSession: ctx.dbSession });

    ctx.body = 'OK';
    ctx.status = 200;
  });
}
