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
    let autoLogin = alaska.main.getConfig('autoLogin');
    if (autoLogin && autoLogin.key) {
      params.ctx.cookies.set(autoLogin.key, '', autoLogin);
    }
    delete params.ctx.session.userId;
  }
}
