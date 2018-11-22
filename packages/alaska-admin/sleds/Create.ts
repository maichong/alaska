import { Sled } from 'alaska-sled';
import USER from 'alaska-user';
import service, { ActionSledParams } from '..';

/**
 * 注册管理员后台菜单
 */
export default class Create extends Sled<ActionSledParams, any> {
  async exec(params: ActionSledParams): Promise<any> {
    const model = params.model;
    const body = params.body;
    // eslint-disable-next-line
    let record = new model(body);
    if (body.id) {
      record._id = body.id;
    }
    record._id = String(record._id);
    let ability = model.id + '.create';
    if (!await USER.hasAbility(params.ctx.user, ability, record)) service.error('Access Denied', 403);
    if (!record._id) service.error('system error of missing id', 500);
    await record.save();
    return record;
  }
}
