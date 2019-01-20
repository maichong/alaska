import { Sled } from 'alaska-sled';
import { ActionSledParams } from '..';

/**
 * 删除数据
 */
export default class Remove extends Sled<ActionSledParams, any> {
  async exec(params: ActionSledParams): Promise<any> {
    await Promise.all(params.records.map(async (record) => {
      record.$session(this.dbSession);
      await record.remove();
    }));
    return {};
  }
}
