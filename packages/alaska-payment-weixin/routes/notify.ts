import { Context, Router } from 'alaska-http';
import paymentService from 'alaska-payment';
import Payment from 'alaska-payment/models/Payment';
import Complete from 'alaska-payment/sleds/Complete';
import * as raw from 'raw-body';
import { xml2data, data2xml } from '../utils';

export default function (router: Router) {
  /**
   * 创建记录
   */
  router.all('/payment/notify/weixin', async (ctx: Context) => {
    ctx.set('Content-Type', 'text/xml');

    function failed(msg: string) {
      ctx.body = data2xml({ return_code: 'FAIL', return_msg: msg });
    }

    try {
      let body = await raw(ctx.req);
      let data: any = await xml2data(body);
      if (data.return_code !== 'SUCCESS' || data.result_code !== 'SUCCESS') {
        return failed('not success');
      }

      let paymentId = data.out_trade_no;
      let payment = await Payment.findById(paymentId).session(this.dbSession);
      if (!payment) return failed('out_trade_no error');

      if (payment.state !== 'pending') return failed('invalid state');

      let plugin = paymentService.payments.get(payment.type);

      if (!await plugin.verify(data, payment)) return failed('sign error');

      if (payment.amount * 100 !== data.total_fee) return failed('total_fee error');

      payment.callbackData = data;
      payment.weixin_transaction_id = data.transaction_id;

      await Complete.run({ record: payment }, { dbSession: this.dbSession });

      ctx.body = data2xml({ return_code: 'SUCCESS', return_msg: 'OK' });
    } catch (err) {
      console.error(err.stack);
      failed('ERR');
      ctx.status = 500;
    }
  });
}
