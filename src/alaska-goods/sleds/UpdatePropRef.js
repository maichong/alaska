// @flow

import { Sled } from 'alaska';
import GoodsCat from '../models/GoodsCat';
import GoodsProp from '../models/GoodsProp';

/**
 * 更新分类属性关联关系
 */
export default class UpdatePropRef extends Sled {
  /**
   * @param {string|ObjectId} params.cat 分类ID
   * @param params
   * @returns {Promise.<void>}
   */
  async exec(params: Object) {
    let cid = params.cat;
    let cats = [];
    while (cid) {
      cats.push(cid);
      // $Flow
      let cat: GoodsCat = await GoodsCat.findById(cid);
      if (cat) {
        cid = cat.parent;
      } else {
        cid = '';
      }
    }
    // $Flow
    let props: GoodsProp[] = await GoodsProp.find().where('catsIndex').in(cats);
    for (let prop of props) {
      await prop.updateCatsIndex();
      prop.save();
    }
  }
}
