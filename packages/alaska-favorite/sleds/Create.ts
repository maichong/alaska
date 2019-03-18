import * as _ from 'lodash';
import * as moment from 'moment';
import { Sled } from 'alaska-sled';
import { Model } from 'alaska-model';
import Favorite from '../models/Favorite';
import service, { CreateParams } from '..';

/**
 * 创建收藏
 */
export default class Create extends Sled<CreateParams, Favorite> {
  async exec(params: CreateParams): Promise<Favorite> {
    if (this.result) return this.result; // 在前置插件中已经处理
    let { title, pic, type, path, user } = params;
    if (!user) service.error('missing favorite user');
    if (!type) service.error('missing favorite type');
    if (!path) service.error('missing favorite type path');
    if (!params[path]) service.error('missing favorite target');
    if (!pic || !title) {
      const model = Model.lookup(type) || service.error('type is error!');
      let record = await model.findById(params[path]);
      if (!record) service.error(`missing favorite target record of [${path}]`);
      let titleField: string = model.titleField || '';
      params.title = record.get(titleField);
      params.pic = record.get('pic');
    }
    let record = new Favorite(params);
    //@ts-ignore 收藏目标的字段
    record[path] = params[path];
    await record.save();
    return record.data();
  }
}
