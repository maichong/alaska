import * as _ from 'lodash';
import { Sled } from 'alaska-sled';
import { ActionSledParams } from '..';
import { trimPrivateField, trimDisabledField } from '../utils/utils';

/**
 * 更新数据
 */
export default class Update extends Sled<ActionSledParams, any> {
  async exec(params: ActionSledParams): Promise<any> {
    let results = [];
    for (let record of params.records) {

      let body = _.omit(params.body, '_id', 'id');
      await trimDisabledField(body, params.admin, params.model, record);

      record.set(body);
      await record.save();

      let json = record.toJSON();
      await trimPrivateField(json, params.admin, params.model, record);

      results.push(json);
    }
    return results;
  }
}
