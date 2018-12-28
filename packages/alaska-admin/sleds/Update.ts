import * as _ from 'lodash';
import { Sled } from 'alaska-sled';
import userService from 'alaska-user';
import { ActionSledParams } from '..';
import { Model } from 'alaska-model';

/**
 * 更新数据
 */
export default class Update extends Sled<ActionSledParams, any> {
  async exec(params: ActionSledParams): Promise<any> {
    let { body, records, admin, model } = params;
    let results: any[] = [];

    async function updateRecord(record: Model, data: any) {
      data = _.omit(data, '_id', 'id');
      await userService.trimDisabledField(data, admin, model, record);

      record.set(data);
      await record.save();

      let json = record.toJSON();
      await userService.trimPrivateField(json, admin, model, record);

      results.push(json);
    }

    if (_.isArray(body)) {
      // 同时更新多条记录
      if (body.length !== records.length) this.service.error('Records count not match');

      let recordsMap = _.keyBy(records, 'id');
      for (let info of body) {
        let id = info.id;
        let record = recordsMap[id];
        if (!record) continue;

        await updateRecord(record, info);
      }

    } else {
      for (let record of records) {
        await updateRecord(record, body);
      }
    }

    return results;
  }
}
