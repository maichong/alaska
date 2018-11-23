import * as _ from 'lodash';
import * as Router from 'koa-router';
import { Context } from 'alaska-http';
import { Model } from 'alaska-model';
import { Sled } from 'alaska-sled';
import USER from 'alaska-user';
import service from '..';

export default function (router: Router) {
  router.post('/action', async (ctx: Context) => {
    if (!await USER.hasAbility(ctx.user, 'admin')) service.error('Access Denied', 403);

    const body: any = ctx.request.body;
    let records: Model[] = [];
    const recordsId: string[] = _.values(ctx.query._records || []);
    const modelId = ctx.query._model || service.error('Missing model!');
    const actionName = ctx.query._action || service.error('Missing action!');

    const model = Model.lookup(modelId) || service.error('Model not found!');
    const action = model.actions[actionName] || service.error('Action not found!');
    if (!action.sled) service.error('Missing action sled');
    let sledId = action.sled;
    if (sledId.indexOf('.') < -1) {
      sledId = model.service.id + '.' + sledId;
    }
    const sled = Sled.lookup(sledId) || service.error('Action sled not found!');

    // 验证 action 权限
    const ability = model.id + '.' + actionName;

    if (!recordsId.length) {
      if (!await USER.hasAbility(ctx.user, ability)) service.error('Access Denied', 403);
    } else {
      records = await model.find({ _id: { $in: recordsId }});
      // 数目对不上，说明某个Record不存在
      if (recordsId.length !== records.length) service.error('Record not found!');
      // 验证权限
      for (let record of records) {
        if (!USER.hasAbility(ctx.user, ability, record)) service.error('Access Denied', 403);
      }
    }
    let result = await sled.run({
      ctx,
      admin: ctx.user,
      model,
      records,
      body: body
    });
    if (result) {
      ctx.body = result;
    }
  });
}