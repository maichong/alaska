import { Context, Router } from 'alaska-http';
import paymentService from 'alaska-payment';
import Payment from 'alaska-payment/models/Payment';
import { Sled } from 'alaska-sled';
import * as raw from 'raw-body';
import { ObjectMap } from '@samoyed/types';
import TenpayPlugin from 'alaska-payment-tenpay';
import * as utils from 'alaska-payment-tenpay/utils/utils';
import { PaymentTenpay } from '..';

export default function (router: Router) {
  /**
   * 创建记录
   */
  router.all('/tenpay', async (ctx: Context) => {
    ctx.set('Content-Type', 'text/xml');
    function replay(msg: string) {
      ctx.body = utils.buildXML(msg ? { return_code: 'FAIL', return_msg: msg } : { return_code: 'SUCCESS' });
    }
    try {
      let body = await raw(ctx.req);
      let data: ObjectMap<any> = await utils.parseXML(body);
      if (data.return_code !== 'SUCCESS' || data.result_code !== 'SUCCESS') {
        return replay('not success');
      }
      let success = await (paymentService.plugins.get('tenpay') as TenpayPlugin).verify(data);
      if (!success) {
        return replay('sign error');
      }
      let paymentId = data.out_trade_no;
      let payment = (await Payment.findById(paymentId).session(this.dbSession)) as PaymentTenpay;
      if (!payment) {
        return replay('out_trade_no error');
      }
      if (payment.amount * 100 !== data.total_fee) {
        return replay('total_fee error');
      }
      payment.tenpay_transaction_id = data.transaction_id;
      let sledId = `${paymentService.id}.Complete`;
      const Complete = Sled.lookup(sledId) || paymentService.error('Complete sled not found!');
      await Complete.run({ payment }, { dbSession: this.dbSession });
      ctx.body = 'OK';
      ctx.status = 200;
    } catch (err) {
      console.error(err.stack);
      ctx.status = 500;
      ctx.body = 'ERR';
    }
  });
}
