import * as _ from 'lodash';
import { Sled } from 'alaska-sled';
import Favorite from '../models/Favorite';
import service, { CreateParams } from '..';

/**
 * 创建收藏
 */
export default class Create extends Sled<CreateParams, Favorite> {
  async exec(params: CreateParams): Promise<Favorite> {
    if (this.result) return this.result; // 在前置插件中已经处理
    let { title, pic, type, user } = params;
    if (!user) service.error('missing favorite user!');
    if (!type) service.error('missing favorite type!');
    if (!params[type]) service.error('missing favorite target!');
    let Model = service.types.get(type);
    if (Model) {
      // 去重
      let fav = await Favorite.findOne({ user, type, [type]: params[type] });
      if (fav) return fav;
    }
    if (!pic || !title && Model) {
      let record = await Model.findById(params[type]);
      if (!record) service.error(`Favorite target not found`);
      if (!title) {
        let titleField: string = Model.titleField || '';
        params.title = record.get(titleField);
      }
      if (!pic) {
        params.pic = record.get('pic');
      }
      if (type === 'goods') {
        // @ts-ignore
        params.shop = record.shop;
        // @ts-ignore
        params.brand = record.brand;
      } else if (type === 'shop') {
        // @ts-ignore
        params.brand = record.brand;
      }
    }
    let record = new Favorite(params);
    await record.save();
    return record;
  }
}
