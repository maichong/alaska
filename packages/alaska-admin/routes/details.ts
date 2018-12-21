import * as _ from 'lodash';
import * as checkDepends from 'check-depends';
import * as Router from 'koa-router';
import { Context } from 'alaska-http';
import { Model } from 'alaska-model';
import USER from 'alaska-user';
import service from '..';
import { trimPrivateField } from '../utils/utils';

interface DetailsQuery {
  // 模型id，必须
  _model: string;
  _id: string;
}

export default function (router: Router) {
  router.get('/details', async (ctx: Context) => {
    ctx.state.jsonApi = true;
    if (!await USER.hasAbility(ctx.user, 'admin')) service.error('Access Denied', 403);

    const id = ctx.query._id || service.error('Missing id!');
    const modelId = ctx.query._model || service.error('Missing model!');
    const model = Model.lookup(modelId) || service.error('Model not found!');

    let record = await model.findById(id);
    if (!record) service.error('Record not found', 404);

    // 验证资源权限
    const ability = `${model.id}.read`;
    if (!await USER.hasAbility(ctx.user, ability, record)) service.error('Access Denied', 403);

    let json = record.toJSON();
    await trimPrivateField(json, ctx.user, model, record);

    ctx.body = json;
  });
}
