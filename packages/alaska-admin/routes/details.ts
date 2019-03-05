import * as _ from 'lodash';
import { Context, Router } from 'alaska-http';
import { Model } from 'alaska-model';
import userService from 'alaska-user';
import service from '..';

interface DetailsQuery {
  // 模型id，必须
  _model: string;
  _id: string;
}

export default function (router: Router) {
  router.get('/details', async (ctx: Context) => {
    ctx.service = service;
    if (!ctx.state.ignoreAuthorization) {
      if (!await userService.hasAbility(ctx.user, 'admin')) service.error('Access Denied', 403);
    }

    const id = ctx.query._id || service.error('Missing id!');
    const modelId = ctx.query._model || service.error('Missing model!');
    const model = Model.lookup(modelId) || service.error('Model not found!');

    let record = await model.findById(id);
    if (!record) service.error('Record not found', 404);

    // 验证资源权限
    const ability = `${model.id}.read`;
    if (!ctx.state.ignoreAuthorization) {
      if (!await userService.hasAbility(ctx.user, ability, record)) service.error('Access Denied', 403);
    }

    let json = record.toJSON();
    await userService.trimPrivateField(json, ctx.user, model, record);

    ctx.body = json;
  });
}
