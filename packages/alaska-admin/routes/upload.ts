import * as _ from 'lodash';
import * as Router from 'koa-router';
import { Context } from 'alaska-http';
import { Model } from 'alaska-model';
import USER from 'alaska-user';
import { UploadFile } from 'alaska-middleware-upload';
import ImageField from 'alaska-field-image';
import service from '..';

interface DetailsQuery {
  // 模型id，必须
  _model: string;
  _id: string;
}

export default function (router: Router) {
  router.post('/upload', async (ctx: Context) => {
    if (!await USER.hasAbility(ctx.user, 'admin')) service.error('Access Denied', 403);

    const id = ctx.query._id || service.error('Missing id!');
    const fieldPath = ctx.query._field || service.error('Missing field!');
    const modelId = ctx.query._model || service.error('Missing model!');
    const model = Model.lookup(modelId) || service.error('Model not found!');
    // @ts-ignore
    const field: ImageField = model._fields[fieldPath] || service.error('Field not found!');
    if (typeof field.upload !== 'function') service.error('Can not upload to the field!');
    const file: UploadFile = (ctx.files.file as UploadFile) || service.error('File not found!');

    if (id === '_new') {
      // 验证资源权限
      const ability = `${model.id}.create`;
      if (!await USER.hasAbility(ctx.user, ability)) service.error('Access Denied', 403);
    } else {
      let record = await model.findById(id);
      if (!record) service.error('Record not found');
      // 验证资源权限
      const ability = `${model.id}.update`;
      if (!await USER.hasAbility(ctx.user, ability, record)) service.error('Access Denied', 403);
    }

    // TODO: 检查字段权限

    ctx.body = await field.upload(file);
  });
}
