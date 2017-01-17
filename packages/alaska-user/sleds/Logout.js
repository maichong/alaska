// @flow

import alaska, { Sled } from 'alaska';

/**
 * 注销
 */
export default class Logout extends Sled {
  /**
   * @param {Object} params
   *                 params.ctx
   */
  async exec(params: { ctx:Alaska$Context }) {
    let key = alaska.main.config('autoLogin.key');
    if (key) {
      params.ctx.cookies.set(key);
    }
    delete params.ctx.session.userId;
  }
}
