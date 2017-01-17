// @Flow

import { Sled } from 'alaska';
import Ability from '../models/Ability';

/**
 * 注册权限
 */
export default class RegisterAbility extends Sled {
  /**
   * @param params
   *        params.id
   *        params.title
   *        params.sort
   *        params.service
   * @returns {Ability}
   */
  async exec(params) {
    let id = params._id || params.id;
    let ability = await Ability.findById(id);
    if (ability) {
      //权限已经存在
      return ability;
    }
    console.log(`Register ability : ${id}`);
    ability = new Ability(params);
    ability._id = id;
    await ability.save();
    return ability;
  }
}
