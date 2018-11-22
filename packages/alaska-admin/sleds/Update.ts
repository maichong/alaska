import { Sled } from 'alaska-sled';
import { ActionSledParams } from '..';

/**
 * 注册管理员后台菜单
 */
export default class Create extends Sled<ActionSledParams, any> {
  async exec(params: ActionSledParams): Promise<any> {
    let results = [];
    for (let record of params.records) {
      record.set(params.body);
      await record.save();
      results.push(record);
    }
    return results;
  }
}
