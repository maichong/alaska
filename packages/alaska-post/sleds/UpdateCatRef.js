// @flow

import { Sled } from 'alaska';
import PostCat from '../models/PostCat';

/**
 * 更新分类父子关系
 */
export default class UpdateCatRef extends Sled {
  /**
   * @param {string|ObjectId} params.cat 父分类ID
   */
  async exec(params: {
    cat:string|Object
  }) {
    // $Flow  findById
    let cat: ?PostCat = await PostCat.findById(params.cat);
    if (!cat) return;
    // $Flow  find
    let subs: PostCat[] = await PostCat.find({
      parent: cat._id
    });
    // $Flow  c._id和PostCat不兼容
    cat.subCats = subs.map((c: PostCat) => c._id);
    await cat.save();
  }
}
