import { Sled } from 'alaska-sled';
import { ActionSledParams } from '..';

/**
 * 删除数据
 */
export default class Remove extends Sled<ActionSledParams, any> {
  async exec(params: ActionSledParams): Promise<any> {
    for (let record of params.records) {
      await record.remove();
    }
    return {};
  }
}
