// @flow

import alaska, { Sled } from 'alaska';

/**
 * 注销
 */
export default class Logout extends Sled {
  /**
   * @param {Object} data
   *                 data.ctx
   */
  async exec(data: { ctx:Alaska$Context }) {
    let key = alaska.main.config('autoLogin.key');
    if (key) {
      data.ctx.cookies.set(key);
    }
    delete data.ctx.session.userId;
  }
}
