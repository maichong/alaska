import { Sled } from 'alaska-sled';
import USER from 'alaska-user';
import service, { ActionSledParams } from '..';
import { trimPrivateField, trimDisabledField } from '../utils/utils';

/**
 * 创建数据
 */
export default class Create extends Sled<ActionSledParams, any> {
  async exec(params: ActionSledParams): Promise<any> {
    const model = params.model;
    const body = params.body;

    // eslint-disable-next-line new-cap
    let tmp = new model(body);
    await trimDisabledField(body, params.admin, model, tmp);

    // eslint-disable-next-line new-cap
    let record = new model(body);
    let ability = `${model.id}.create`;
    if (!await USER.hasAbility(params.ctx.user, ability, record)) service.error('Access Denied', 403);
    await record.save();

    let json = record.toJSON();
    await trimPrivateField(json, params.admin, model, record);

    return json;
  }
}
