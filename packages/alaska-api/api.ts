import * as _ from 'lodash';
import * as stream from 'stream';
import { Context } from 'alaska-http';
import { PUBLIC, Service } from 'alaska';
import { Model } from 'alaska-model';
import { mergeFilters } from 'alaska-model/utils';
import { UserService } from 'alaska-user';
import { } from 'koa-bodyparser';

let userService: UserService;
Service.resolveMain().then((main) => {
  if (!main.modules.services['alaska-user']) return;
  // @ts-ignore
  userService = main.modules.services['alaska-user'].service;
});

export async function count(ctx: Context) {
  const model: typeof Model = ctx.state.model;

  const ability = `${model.id}.read`;
  let abilityFilters;

  if (model.api.count > PUBLIC) {
    if (!userService) model.service.error(401);
    abilityFilters = await userService.createFilters(ctx.user, ability);
    if (!abilityFilters) model.service.error(ctx.user ? 403 : 401);
  }

  let filters = await model.createFiltersByContext(ctx);

  let finalFilters = mergeFilters(filters, abilityFilters);

  let groups: string[] = (ctx.state.groupby || ctx.query._groupby || '').split(',');
  if (groups.length) {
    groups = groups.filter((g) => model.fields[g] && model.fields[g].protected !== true);
  }

  if (groups.length) {
    let _id: any = {};
    groups.forEach((g) => {
      _id[g] = `$${g}`;
    })
    let query = model.aggregate();
    if (_.size(finalFilters)) {
      query.match(finalFilters);
    }
    let result = await query.group({ _id, count: { $sum: 1 } });
    let res = {
      count: 0,
      gorups: [] as any[]
    };
    _.forEach(result, (r) => {
      r._id.count = r.count;
      res.count += r.count;
      res.gorups.push(r._id);
    });
    ctx.body = res;
  } else {
    ctx.body = {
      count: await model.countDocuments(finalFilters)
    };
  }
}

export async function paginate(ctx: Context) {
  const model: typeof Model = ctx.state.model;

  const ability = `${model.id}.read`;
  let abilityFilters;

  if (model.api.paginate > PUBLIC) {
    if (!userService) model.service.error(401);
    abilityFilters = await userService.createFilters(ctx.user, ability);
    if (!abilityFilters) model.service.error(ctx.user ? 403 : 401);
  }

  const scope = ctx.state.scope || ctx.query._scope || 'list';

  let filters = await model.createFiltersByContext(ctx);

  let results = await model.paginateByContext(ctx, { scope, filters: mergeFilters(filters, abilityFilters) });

  ctx.state.paginateResults = results;

  // 过滤 protected 和 private 字段
  let list = [];
  for (let record of results.results) {
    let data = record.data(scope);
    list.push(data);
    if (!userService) continue;
    await userService.trimProtectedField(data, ctx.user, model, record);
  }
  ctx.body = _.assign({}, results, {
    results: list
  });
}

export async function list(ctx: Context) {
  const model: typeof Model = ctx.state.model;

  const ability = `${model.id}.read`;
  let abilityFilters;
  if (model.api.list > PUBLIC) {
    if (!userService) model.service.error(401);
    abilityFilters = await userService.createFilters(ctx.user, ability);
    if (!abilityFilters) model.service.error(ctx.user ? 403 : 401);
  }

  const scope = ctx.state.scope || ctx.query._scope || 'list';

  let filters = await model.createFiltersByContext(ctx);

  let results = await model.listByContext(ctx, { scope, filters: mergeFilters(filters, abilityFilters) });

  ctx.state.listResults = results;

  // 过滤 protected 和 private 字段
  let list = [];
  for (let record of results) {
    let data = record.data(scope);
    list.push(data);
    if (!userService) continue;
    await userService.trimProtectedField(data, ctx.user, model, record);
  }

  ctx.body = list;
}

export async function show(ctx: Context) {
  const model: typeof Model = ctx.state.model;

  const ability = `${model.id}.read`;
  if (model.api.show > PUBLIC) {
    if (!userService) model.service.error(401);
  }

  const scope = ctx.state.scope || ctx.query._scope || 'show';

  let record = await model.showByContext(ctx, { scope });
  if (!record) {
    //404
    return;
  }
  if (model.api.show > PUBLIC && !await userService.hasAbility(ctx.user, ability, record)) {
    model.service.error(ctx.user ? 403 : 401);
  }

  ctx.state.record = record;
  ctx.body = record.data(ctx.state.scope || ctx.query._scope || scope);

  if (userService) {
    await userService.trimProtectedField(ctx.body, ctx.user, model, record);
  }
}

export async function create(ctx: Context) {
  const model: typeof Model = ctx.state.model;

  const ability = `${model.id}.create`;
  let body = Object.assign({}, ctx.state.body || ctx.request.body);

  if (userService) {
    // eslint-disable-next-line new-cap
    let tmp = new model(body);
    await userService.trimDisabledField(body, ctx.user, model, tmp);
  }

  // eslint-disable-next-line new-cap
  let record = new model(body);

  if (model.api.create > PUBLIC) {
    if (!userService) model.service.error(401);
    if (!await userService.hasAbility(ctx.user, ability, record)) {
      model.service.error(ctx.user ? 403 : 401);
    }
  }

  await record.save();
  ctx.state.record = record;
  ctx.body = record.data('create');

  if (userService) {
    await userService.trimProtectedField(ctx.body, ctx.user, model, record);
  }
}

export async function update(ctx: Context) {
  const model: typeof Model = ctx.state.model;

  const ability = `${model.id}.update`;

  let filters = await model.createFiltersByContext(ctx);

  let record = await model.findById(ctx.state.id || ctx.params.id).where(filters);
  if (!record) {
    //404
    return;
  }

  if (model.api.update > PUBLIC) {
    if (!userService) model.service.error(401);
    if (!await userService.hasAbility(ctx.user, ability, record)) {
      model.service.error(ctx.user ? 403 : 401);
    }
  }

  let body = Object.assign({}, ctx.state.body || ctx.request.body);

  if (userService) {
    await userService.trimDisabledField(body, ctx.user, model, record);
  }

  record.set(body);

  const scope = ctx.state.scope || ctx.query._scope;
  if (!scope) {
    record.__modifiedPaths = [];
  }
  await record.save();
  ctx.state.record = record;
  if (scope) {
    ctx.body = record.data(scope);
  } else {
    ctx.body = _.pick(record.data('update'), 'id', record.__modifiedPaths);
    delete record.__modifiedPaths;
  }

  if (userService) {
    await userService.trimProtectedField(ctx.body, ctx.user, model, record);
  }
}

export async function updateMulti(ctx: Context) {
  const model: typeof Model = ctx.state.model;

  const ability = `${model.id}.update`;
  let abilityFilters;

  if (model.api.updateMulti > PUBLIC) {
    if (!userService) model.service.error(401);
    abilityFilters = await userService.createFilters(ctx.user, ability);
    if (!abilityFilters) model.service.error(ctx.user ? 403 : 401);
  }

  let filters = await model.createFiltersByContext(ctx);

  let body = Object.assign({}, ctx.state.body || ctx.request.body);

  if (userService) {
    await userService.trimDisabledField(body, ctx.user, model);
  }

  let res = await model.update(mergeFilters(filters, abilityFilters), body, { multi: true });

  ctx.body = {
    updated: res.nModified
  };
}

export async function remove(ctx: Context) {
  const model: typeof Model = ctx.state.model;

  const ability = `${model.id}.remove`;

  let filters = await model.createFiltersByContext(ctx);

  let record = await model.findById(ctx.state.id || ctx.params.id).where(filters);
  if (!record) {
    //404
    ctx.body = {};
    return;
  }

  if (model.api.update > PUBLIC) {
    if (!userService) model.service.error(401);
    if (!await userService.hasAbility(ctx.user, ability, record)) {
      model.service.error(ctx.user ? 403 : 401);
    }
  }

  await record.remove();

  ctx.body = {};
}

export async function removeMulti(ctx: Context) {
  const model: typeof Model = ctx.state.model;

  const ability = `${model.id}.remove`;
  let abilityFilters;

  if (model.api.updateMulti > PUBLIC) {
    if (!userService) model.service.error(401);
    abilityFilters = await userService.createFilters(ctx.user, ability);
    if (!abilityFilters) model.service.error(ctx.user ? 403 : 401);
  }

  ctx.body = {};
  let filters = await model.createFiltersByContext(ctx);

  let res = await model.deleteMany(mergeFilters(filters, abilityFilters));

  ctx.body = {
    removed: res.n
  };
}

/**
 * 将普通Filters转换为Aggregation Match
 * @param filters
 */
function filtersToMatch(filters: any): any {
  let match: any = {};
  for (let key of Object.keys(filters)) {
    let nkey = key;
    if (nkey[0] !== '$') {
      nkey = `fullDocument.${key}`;
    }
    let value = filters[key];
    if (_.isPlainObject(value)) {
      value = filtersToMatch(value);
    }
    match[nkey] = value;
  }
  return match;
}

/**
 * Watch 接口
 * 如果是删除事件，返回的object中只有ID，并且Filters将失效
 */
export async function watch(ctx: Context) {
  const model: typeof Model = ctx.state.model;

  const ability = `${model.id}.read`;
  let abilityFilters;

  if (model.api.updateMulti > PUBLIC) {
    if (!userService) model.service.error(401);
    abilityFilters = await userService.createFilters(ctx.user, ability);
    if (!abilityFilters) model.service.error(ctx.user ? 403 : 401);
  }

  let s = new stream.PassThrough();
  ctx.body = s;
  ctx.type = 'json';

  let filters = await model.createFiltersByContext(ctx);
  filters = mergeFilters(filters, abilityFilters);

  let pipeline = [];
  if (filters) {
    let match = { $or: [filtersToMatch(filters), { operationType: 'delete' }] };
    pipeline.push({ $match: match });
  }

  let changeStream = model.watch(pipeline, {
    fullDocument: 'updateLookup'
  });

  changeStream.on('change', async (change) => {
    let object;
    let type = 'MODIFIED';
    switch (change.operationType) {
      case 'delete':
        type = 'DELETED';
        object = { id: change.documentKey._id };
        break;
      case 'insert':
        type = 'ADDED';
        break;
    }

    if (!object) {
      let data = change.fullDocument || change.documentKey;
      if (!data) return;
      // eslint-disable-next-line
      let record = new model(data);
      object = record.data();

      if (userService) {
        await userService.trimProtectedField(object, ctx.user, model, record);
      }
    }

    s.write(`${JSON.stringify({ type, object })}\n`);
  });
  changeStream.on('close', () => {
    s.end();
  });
  ctx.request.socket.on('close', () => {
    if (!changeStream.isClosed) {
      changeStream.close();
    }
  });
}
