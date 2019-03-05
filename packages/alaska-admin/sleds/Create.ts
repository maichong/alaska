import { Sled } from 'alaska-sled';
import userService from 'alaska-user';
import service, { ActionSledParams } from '..';

/**
 * 创建数据
 */
export default class Create extends Sled<ActionSledParams, any> {
  async exec(params: ActionSledParams): Promise<any> {
    const model = params.model;
    const body = params.body;

    // eslint-disable-next-line new-cap
    let tmp = new model(body);
    await userService.trimDisabledField(body, params.admin, model, tmp);

    // eslint-disable-next-line new-cap
    let record = new model(body);

    let ability = `${model.id}.create`;
    if (!params.ctx.state.ignoreAuthorization) {
      if (!await userService.hasAbility(params.ctx.user, ability, record)) service.error('Access Denied', 403);
    }

    await record.save({ session: this.dbSession });

    let json = record.toJSON();
    await userService.trimPrivateField(json, params.admin, model, record);

    return json;
  }
}
