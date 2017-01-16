import alaska from 'alaska';
import Ability from '../models/Ability';

/**
 * 注册权限
 */
export default class RegisterAbility extends alaska.Sled {
  /**
   * @param data
   *        data.id
   *        data.title
   *        data.sort
   *        data.service
   * @returns {Ability}
   */
  async exec(data) {
    let id = data._id || data.id;
    let ability = await Ability.findCache(id);
    if (ability) {
      //权限已经存在
      return ability;
    }
    console.log(`Register ability : ${id}`);
    ability = new Ability(data);
    ability._id = id;
    await ability.save();
    return ability;
  }
}
