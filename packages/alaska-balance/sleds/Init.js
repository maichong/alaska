import { Sled } from 'alaska';
import USER from 'alaska-user';

export default class Init extends Sled {
  exec() {
    USER.run('RegisterAbility', {
      id: 'admin.alaska-balance.withdraw.accept',
      title: 'Accept Withdraw',
      service: 'alaska-admin'
    });
    USER.run('RegisterAbility', {
      id: 'admin.alaska-balance.withdraw.reject',
      title: 'Reject Withdraw',
      service: 'alaska-admin'
    });
  }
}
