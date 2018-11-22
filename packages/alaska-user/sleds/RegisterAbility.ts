import { Sled } from 'alaska-sled';
import Ability from '../models/Ability';
import { RegisterAbilityParams } from '..';

/**
 * 注册权限
 */
export default class RegisterAbility extends Sled<RegisterAbilityParams, Ability> {
  /**
   * @param params
   *        params.id
   *        params.title
   *        params.sort
   *        params.service
   * @returns {Ability}
   */
  async exec(params: RegisterAbilityParams): Promise<Ability> {
    let id = params.id;
    let ability = await Ability.findById(id);
    if (ability) {
      //权限已经存在
      return ability;
    }
    console.log(`Register ability: ${id}`);
    ability = new Ability(params);
    ability._id = id;
    await ability.save();
    return ability;
  }
}
