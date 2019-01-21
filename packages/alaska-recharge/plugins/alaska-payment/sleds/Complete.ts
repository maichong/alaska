import RECHARGE from 'alaska-recharge';
import Payment from 'alaska-payment/models/Payment';
import CompletePayment from 'alaska-payment/sleds/Complete';
import Recharge from '../../../models/Recharge';
import CompleteRecharge from '../../../sleds/Complete';
import { } from '../../..';

export async function pre() {
  const me: CompletePayment = this;
  let payment: Payment = me.params.record;
  if (!payment.recharge) return;

  let recharge = payment.recharge;

  let record = await Recharge.findById(recharge).session(me.dbSession);

  if (!record) RECHARGE.error('Can not find recharge record!');

  await CompleteRecharge.run({ record }, { dbSession: me.dbSession });

  me.params.done = true;
}
