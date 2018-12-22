import * as _ from 'lodash';
import { Sled } from 'alaska-sled';
import userService from 'alaska-user';
import { ActionSledParams } from '..';

/**
 * 更新数据
 */
export default class Update extends Sled<ActionSledParams, any> {
  async exec(params: ActionSledParams): Promise<any> {
    let results = [];
    for (let record of params.records) {

      let body = _.omit(params.body, '_id', 'id');
      await userService.trimDisabledField(body, params.admin, params.model, record);

      record.set(body);
      await record.save();

      let json = record.toJSON();
      await userService.trimPrivateField(json, params.admin, params.model, record);

      results.push(json);
    }
    return results;
  }
}
