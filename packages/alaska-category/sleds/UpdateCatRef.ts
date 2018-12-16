import { Sled } from 'alaska-sled';
import * as _ from 'lodash';
import { isIdEqual } from 'alaska-model/utils';
import Category from '../models/Category';
import { UpdateCatRefParams } from '..';

export default class UpdateCatRef extends Sled<UpdateCatRefParams, void> {
  async exec(params: UpdateCatRefParams) {
    let { category, removed } = params;

    let parent;
    if (category.parent) {
      parent = await Category.findById(category.parent);
    }

    if (removed) {
      // 已删除
      if (category.parent) {
        if (parent) {
          await UpdateCatRef.run({ category: parent });
        }
      }
      return;
    }

    let children = await Category.find({ parent: category._id }).select('_id');
    category.children = _(children).mapValues('_id').values().value();

    // update parents
    if (parent) {
      if (!isIdEqual(_.last(category.parents), category.parent)) {
        // update parents
        category.parents = _.concat(parent.parents, [parent._id]);
        await category.save();
        // update parent.children
        await UpdateCatRef.run({ category: parent });
      }
    } else {
      await category.save();
    }

    // update other.children
    let others = await Category.find({ children: category._id });
    for (let other of others) {
      if (parent && isIdEqual(other, parent)) continue;
      other.children = _.filter(other.children, (child) => !isIdEqual(child, category));
      await other.save();
    }
  }
}
