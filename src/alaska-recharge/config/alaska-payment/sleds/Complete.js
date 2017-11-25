import RECHARGE from 'alaska-recharge';
import Recharge from 'alaska-recharge/models/Recharge';

export async function pre() {
  let payment = this.params.payment;
  if (!payment.recharge) return;

  let recharge = payment.recharge;

  let record = await Recharge.findById(recharge);

  if (!record) RECHARGE.error('Can not find recharge record!');

  await RECHARGE.run('Complete', {
    recharge: record
  });

  this.params.done = true;
}
