import { Sled } from 'alaska-sled';
import { ActionSledParams } from '..';

/**
 * 注册管理员后台菜单
 */
export default class Create extends Sled<ActionSledParams, any> {
  async exec(params: ActionSledParams): Promise<any> {
    for (let record of params.records) {
      await record.remove();
    }
    return {};
  }
}
