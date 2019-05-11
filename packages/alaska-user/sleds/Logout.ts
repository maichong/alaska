import { Sled } from 'alaska-sled';
import { LogoutParams } from '..';

/**
 * 注销
 */
export default class Logout extends Sled<LogoutParams, void> {
  /**
   * @param {Object} params
   *                 params.ctx
   */
  async exec(params: LogoutParams): Promise<void> {
    let autoLogin = this.service.main.config.get('autoLogin');
    if (autoLogin && autoLogin.key) {
      params.ctx.cookies.set(autoLogin.key, '', autoLogin);
    }
    delete params.ctx.session.userId;
    delete params.ctx.session.password;
  }
}
