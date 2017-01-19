// @flow

import { Sled } from 'alaska';
import GoodsCat from '../models/GoodsCat';

/**
 * 更新分类父子关系
 */
export default class UpdateCatRef extends Sled {
  /**
   * @param params
   * @param {string|ObjectId} params.cat 父分类ID
   */
  async exec(params: Object) {
    // $Flow findById
    let cat:GoodsCat = await GoodsCat.findById(params.cat);
    if (!cat) return;
    // $Flow  find
    let subs:GoodsCat[] = await GoodsCat.find({ cat: cat._id });
    // $Flow v._id类型太多 确认正确
    cat.subCats = subs.map((sub:GoodsCat) => (sub._id));
    await cat.save();
  }
}
