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
    let cat:?Object = await GoodsCat.findById(params.cat);
    if (!cat) return;
    // $Flow  find
    let subs:Object[] = await GoodsCat.find({ cat: cat._id });
    cat.subCats = subs.map((sub:Object) => sub._id);
    await cat.save();
  }
}
