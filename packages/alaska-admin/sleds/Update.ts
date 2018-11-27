import * as _ from 'lodash';
import * as checkDepends from 'check-depends';
import { Sled } from 'alaska-sled';
import { ActionSledParams } from '..';

/**
 * 注册管理员后台菜单
 */
export default class Create extends Sled<ActionSledParams, any> {
  async exec(params: ActionSledParams): Promise<any> {
    let results = [];
    for (let record of params.records) {
      record.set(_.omit(params.body, '_id', 'id'));
      await record.save();

      let json = record.toJSON();
      _.forEach(params.model._fields, (field, path) => {
        if (checkDepends(field.protected, record)) {
          delete json[path];
        }
      });

      results.push(json);
    }
    return results;
  }
}
