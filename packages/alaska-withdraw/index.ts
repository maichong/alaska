
import * as _ from 'lodash';
import { Service, Plugin } from 'alaska';

/**
 * @class WithdrawService
 */
class WithdrawService extends Service {
  withdrawPlugins = new Map();
}

export default new WithdrawService({
  id: 'alaska-withdraw'
});

export class WithdrawPlugin<C = any> extends Plugin<C> {
  static readonly classOfWithdrawPlugin = true;
  readonly instanceOfWithdrawPlugin = true;
}
