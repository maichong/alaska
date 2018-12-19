import * as _ from 'lodash';
import * as stream from 'stream';
import { Context } from 'alaska-http';
import { PUBLIC, Service } from 'alaska';
import { Model } from 'alaska-model';
import { mergeFilters } from 'alaska-model/utils';
import { UserService } from 'alaska-user';
import { } from 'koa-bodyparser';

let USER: UserService;
Service.resolveMain().then((main) => {
  if (!main.modules.services['alaska-user']) return;
  // @ts-ignore
  USER = main.modules.services['alaska-user'].service;
});

export async function count(ctx: Context) {
  const model: typeof Model = ctx.state.model;

  const ability = model.id + '.read';
  let abilityFilters;

  if (model.api.count > PUBLIC) {
    if (!USER) {
      ctx.status = 401;
      return;
    }
    abilityFilters = await USER.createFilters(ctx.user, ability);
    if (!abilityFilters) {
      ctx.status = ctx.user ? 403 : 401;
      return;
    }
  }

  let filters = await model.createFiltersByContext(ctx);

  ctx.body = {
    count: await model.countDocuments(mergeFilters(filters, abilityFilters))
  };
}

export async function paginate(ctx: Context) {
  const model: typeof Model = ctx.state.model;

  const ability = model.id + '.read';
  let abilityFilters;

  if (model.api.paginate > PUBLIC) {
    if (!USER) {
      ctx.status = 401;
      return;
    }
    abilityFilters = await USER.createFilters(ctx.user, ability);
    if (!abilityFilters) {
      ctx.status = ctx.user ? 403 : 401;
      return;
    }
  }

  const scope = ctx.state.scope || ctx.query._scope || 'list';

  let filters = await model.createFiltersByContext(ctx);

  let results = await model.paginateByContext(ctx, { scope, filters: mergeFilters(filters, abilityFilters) });

  ctx.state.paginateResults = results;

  ctx.body = _.assign({}, results, {
    results: results.results.map((doc: Model) => doc.data(scope))
  });
}

export async function list(ctx: Context) {
  const model: typeof Model = ctx.state.model;

  const ability = model.id + '.read';
  let abilityFilters;
  if (model.api.list > PUBLIC) {
    if (!USER) {
      ctx.status = 401;
      return;
    }
    abilityFilters = await USER.createFilters(ctx.user, ability);
    if (!abilityFilters) {
      ctx.status = ctx.user ? 403 : 401;
      return;
    }
  }

  const scope = ctx.state.scope || ctx.query._scope || 'list';

  let filters = await model.createFiltersByContext(ctx);

  let results = await model.listByContext(ctx, { scope, filters: mergeFilters(filters, abilityFilters) });

  ctx.state.listResults = results;

  ctx.body = results.map((doc: Model) => doc.data(scope));
}

export async function show(ctx: Context) {
  const model: typeof Model = ctx.state.model;

  const ability = model.id + '.read';
  if (model.api.show > PUBLIC) {
    if (!USER) {
      ctx.status = 401;
      return;
    }
  }

  const scope = ctx.state.scope || ctx.query._scope || 'show';

  let record = await model.showByContext(ctx, { scope });
  if (!record) {
    //404
    return;
  }
  if (model.api.show > PUBLIC && !await USER.hasAbility(ctx.user, ability, record)) {
    ctx.status = ctx.user ? 403 : 401;
    return;
  }

  ctx.state.record = record;
  ctx.body = record.data(ctx.state.scope || ctx.query._scope || scope);
}

export async function create(ctx: Context) {
  const model: typeof Model = ctx.state.model;

  const ability = model.id + '.create';
  // eslint-disable-next-line
  let record = new model(ctx.state.body || ctx.request.body);

  if (model.api.create > PUBLIC) {
    if (!USER) {
      ctx.status = 401;
      return;
    }
    if (!await USER.hasAbility(ctx.user, ability, record)) {
      ctx.status = ctx.user ? 403 : 401;
      return;
    }
  }

  await record.save();
  ctx.state.record = record;
  ctx.body = record.data('create');
}

export async function update(ctx: Context) {
  const model: typeof Model = ctx.state.model;

  const ability = model.id + '.update';

  let filters = await model.createFiltersByContext(ctx);

  let record = await model.findById(ctx.state.id || ctx.params.id).where(filters);
  if (!record) {
    //404
    return;
  }

  if (model.api.update > PUBLIC) {
    if (!USER) {
      ctx.status = 401;
      return;
    }
    if (!await USER.hasAbility(ctx.user, ability, record)) {
      ctx.status = ctx.user ? 403 : 401;
      return;
    }
  }

  let body = Object.assign({}, ctx.state.body || ctx.request.body);

  // TODO: 不允许更新private 字段
  _.forEach(model.fields, (conf, key) => {
    if (conf.private) {
      delete body[key];
    }
  });

  record.set(body);

  if (model.api.update > PUBLIC) {
    if (!await USER.hasAbility(ctx.user, ability, record)) {
      ctx.status = ctx.user ? 403 : 401;
      return;
    }
  }

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
}

export async function updateMulti(ctx: Context) {
  const model: typeof Model = ctx.state.model;

  const ability = model.id + '.update';
  let abilityFilters;

  if (model.api.updateMulti > PUBLIC) {
    if (!USER) {
      ctx.status = 401;
      return;
    }
    abilityFilters = await USER.createFilters(ctx.user, ability);
    if (!abilityFilters) {
      ctx.status = ctx.user ? 403 : 401;
      return;
    }
  }

  let filters = await model.createFiltersByContext(ctx);

  let body = Object.assign({}, ctx.state.body || ctx.request.body);

  // 不允许更新private 字段
  _.forEach(model.fields, (conf, key) => {
    if (conf.private) {
      delete body[key];
    }
  });

  let res = await model.update(mergeFilters(filters, abilityFilters), body, { multi: true });

  ctx.body = {
    updated: res.nModified
  };
}

export async function remove(ctx: Context) {
  const model: typeof Model = ctx.state.model;

  const ability = model.id + '.remove';

  let filters = await model.createFiltersByContext(ctx);

  let record = await model.findById(ctx.state.id || ctx.params.id).where(filters);
  if (!record) {
    //404
    ctx.body = {};
    return;
  }

  if (model.api.update > PUBLIC) {
    if (!USER) {
      ctx.status = 401;
      return;
    }
    if (!await USER.hasAbility(ctx.user, ability, record)) {
      ctx.status = ctx.user ? 403 : 401;
      return;
    }
  }

  await record.remove();

  ctx.body = {};
}

export async function removeMulti(ctx: Context) {
  const model: typeof Model = ctx.state.model;

  const ability = model.id + '.remove';
  let abilityFilters;

  if (model.api.updateMulti > PUBLIC) {
    if (!USER) {
      ctx.status = 401;
      return;
    }
    abilityFilters = await USER.createFilters(ctx.user, ability);
    if (!abilityFilters) {
      ctx.status = ctx.user ? 403 : 401;
      return;
    }
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
      nkey = 'fullDocument.' + key;
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

  const ability = model.id + '.read';
  let abilityFilters;

  if (model.api.updateMulti > PUBLIC) {
    if (!USER) {
      ctx.status = 401;
      return;
    }
    abilityFilters = await USER.createFilters(ctx.user, ability);
    if (!abilityFilters) {
      ctx.status = ctx.user ? 403 : 401;
      return;
    }
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

  changeStream.on('change', (change) => {
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
    }
    s.write(JSON.stringify({ type, object }) + '\n');
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
