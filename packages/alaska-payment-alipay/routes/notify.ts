import { Context, Router } from 'alaska-http';
import paymentService from 'alaska-payment';
import Payment from 'alaska-payment/models/Payment';
import { Sled } from 'alaska-sled';
import AlipayPlugin from 'alaska-payment-alipay';

interface PaymentAlipay extends Payment {
  alipay_trade_no: string;
  alipay_buyer_email: string;
}

export default function (router: Router) {
  /**
   * 创建记录
   */
  router.all('/alipay', async (ctx: Context) => {
    ctx.status = 400;
    ctx.body = 'ERR';
    if (ctx.method !== 'POST') return;
    let body = ctx.state.body || ctx.request.body;
    if (!body || body.trade_status !== 'TRADE_SUCCESS') return;

    let success = await (paymentService.plugins.alipay as AlipayPlugin).verify(body);

    if (!success) return;
    let paymentId = body.out_trade_no;

    let payment = (await Payment.findById(paymentId).session(ctx.dbSession)) as PaymentAlipay;
    if (!payment) return;
    payment.alipay_trade_no = body.trade_no;
    payment.alipay_buyer_email = body.buyer_email;
    try {
      let sledId = `${paymentService.id}.Complete`;
      const Complete = Sled.lookup(sledId) || paymentService.error('Complete sled not found!');
      await Complete.run({ payment }, { dbSession: this.dbSession });
      ctx.body = 'OK';
      ctx.status = 200;
    } catch (error) {
      console.error(error.stack);
      ctx.status = 500;
      ctx.body = 'ERR';
    }
  });
}
