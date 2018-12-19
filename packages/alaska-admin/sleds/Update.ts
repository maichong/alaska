import * as _ from 'lodash';
import * as checkDepends from 'check-depends';
import { Sled } from 'alaska-sled';
import { ActionSledParams } from '..';

/**
 * 更新数据
 */
export default class Update extends Sled<ActionSledParams, any> {
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
