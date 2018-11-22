import { Sled } from 'alaska-sled';
import RegisterAbility from 'alaska-user/sleds/RegisterAbility';

export default class Init extends Sled<void, void> {
  exec() {
    RegisterAbility.run({
      id: 'admin.alaska-balance.withdraw.accept',
      title: 'Accept Withdraw',
      service: 'alaska-admin'
    });
    RegisterAbility.run({
      id: 'admin.alaska-balance.withdraw.reject',
      title: 'Reject Withdraw',
      service: 'alaska-admin'
    });
  }
}
