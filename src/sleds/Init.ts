import { Sled } from 'alaska-sled';
import User from 'alaska-user/models/User';

export default class Init extends Sled<{}, void> {
  async exec() {
    let user = await User.findOne({ username: 'alaska' });
    if (!user) {
      user = new User({
        username: 'alaska',
        password: '123456',
        roles: ['root']
      });
      await user.save();
    } else {
      if (!user.roles || !user.roles.length) {
        user.roles = ['root'];
      }
      await user.save();
    }
  }
}
