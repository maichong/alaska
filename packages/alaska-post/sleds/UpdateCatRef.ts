import { Sled } from 'alaska-sled';
import PostCat from '../models/PostCat';
import { UpdateCatRefParams } from '..';

/**
 * 更新分类父子关系
 */
export default class UpdateCatRef extends Sled<UpdateCatRefParams, void> {
  /**
   * @param {Object} params
   * @param {string|ObjectId} params.cat 父分类ID
   */
  async exec(params: UpdateCatRefParams) {
    let cat: PostCat = await PostCat.findById(params.cat);
    if (!cat) return;
    let subs: PostCat[] = await PostCat.find({
      parent: cat._id
    });
    cat.subCats = subs.map((c: PostCat) => c._id);
    await cat.save();
  }
}
