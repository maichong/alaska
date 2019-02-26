import Payment from 'alaska-payment/models/Payment';
import CompletePayment from 'alaska-payment/sleds/Complete';
import Recharge from '../../../models/Recharge';
import CompleteRecharge from '../../../sleds/Complete';
import rechargeService, { } from '../../..';

export async function pre() {
  const me: CompletePayment = this;
  let payment: Payment = me.params.record;
  if (!payment.recharge) return;

  let recharge = await Recharge.findById(payment.recharge).session(me.dbSession);

  if (!recharge) rechargeService.error('Can not find recharge record!');

  await CompleteRecharge.run({ record: recharge }, { dbSession: me.dbSession });

  me.params.done = true;
}
