"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const stream = require("stream");
const alaska_1 = require("alaska");
const utils_1 = require("alaska-model/utils");
let userService;
alaska_1.Service.resolveMain().then((main) => {
    userService = main.lookup('alaska-user');
});
async function count(ctx) {
    const model = ctx.state.model;
    const ability = `${model.id}.read`;
    let abilityFilters;
    if (!ctx.state.ignoreAuthorization && model.api.count > alaska_1.PUBLIC) {
        if (!userService)
            model.service.error(401);
        abilityFilters = await userService.createFilters(ctx.user, ability);
        if (!abilityFilters)
            model.service.error(ctx.user ? 403 : 401);
    }
    let filters = await model.createFiltersByContext(ctx);
    let finalFilters = utils_1.mergeFilters(filters, abilityFilters);
    let groups = (ctx.state.groupby || ctx.query._groupby || '').split(',');
    if (groups.length) {
        groups = groups.filter((g) => model.fields[g] && model.fields[g].protected !== true);
    }
    if (groups.length) {
        let _id = {};
        groups.forEach((g) => {
            _id[g] = `$${g}`;
        });
        let query = model.aggregate();
        if (_.size(finalFilters)) {
            query.match(finalFilters);
        }
        let result = await query.group({ _id, count: { $sum: 1 } });
        let res = {
            count: 0,
            groups: []
        };
        _.forEach(result, (r) => {
            r._id.count = r.count;
            res.count += r.count;
            res.groups.push(r._id);
        });
        ctx.body = res;
    }
    else {
        ctx.body = {
            count: await model.countDocuments(finalFilters)
        };
    }
}
exports.count = count;
async function paginate(ctx) {
    const model = ctx.state.model;
    const ability = `${model.id}.read`;
    let abilityFilters;
    if (!ctx.state.ignoreAuthorization && model.api.paginate > alaska_1.PUBLIC) {
        if (!userService)
            model.service.error(401);
        abilityFilters = await userService.createFilters(ctx.user, ability);
        if (!abilityFilters)
            model.service.error(ctx.user ? 403 : 401);
    }
    const scope = ctx.state.scope || ctx.query._scope || 'list';
    let filters = await model.createFiltersByContext(ctx);
    let res = await model.paginateByContext(ctx, { scope, filters: utils_1.mergeFilters(filters, abilityFilters) });
    ctx.state.paginateResults = res;
    let results = [];
    for (let record of res.results) {
        let data = record.data(scope);
        results.push(data);
        if (!userService)
            continue;
        await userService.trimProtectedField(data, ctx.user, model, record);
    }
    ctx.body = _.assign({}, res, {
        results
    });
}
exports.paginate = paginate;
async function list(ctx) {
    const model = ctx.state.model;
    const ability = `${model.id}.read`;
    let abilityFilters;
    if (!ctx.state.ignoreAuthorization && model.api.list > alaska_1.PUBLIC) {
        if (!userService)
            model.service.error(401);
        abilityFilters = await userService.createFilters(ctx.user, ability);
        if (!abilityFilters)
            model.service.error(ctx.user ? 403 : 401);
    }
    const scope = ctx.state.scope || ctx.query._scope || 'list';
    let filters = await model.createFiltersByContext(ctx);
    let res = await model.listByContext(ctx, { scope, filters: utils_1.mergeFilters(filters, abilityFilters) });
    ctx.state.listResults = res;
    let results = [];
    for (let record of res) {
        let data = record.data(scope);
        results.push(data);
        if (!userService)
            continue;
        await userService.trimProtectedField(data, ctx.user, model, record);
    }
    ctx.body = results;
}
exports.list = list;
async function show(ctx) {
    const model = ctx.state.model;
    const ability = `${model.id}.read`;
    if (model.api.show > alaska_1.PUBLIC) {
        if (!userService)
            model.service.error(401);
    }
    const scope = ctx.state.scope || ctx.query._scope || 'show';
    let record = await model.showByContext(ctx, { scope });
    if (!record) {
        return;
    }
    if (!ctx.state.ignoreAuthorization && model.api.show > alaska_1.PUBLIC && !await userService.hasAbility(ctx.user, ability, record)) {
        model.service.error(ctx.user ? 403 : 401);
    }
    ctx.state.record = record;
    ctx.body = record.data(ctx.state.scope || ctx.query._scope || scope);
    if (userService) {
        await userService.trimProtectedField(ctx.body, ctx.user, model, record);
    }
}
exports.show = show;
async function create(ctx) {
    const model = ctx.state.model;
    const ability = `${model.id}.create`;
    let body = Object.assign({}, ctx.state.body || ctx.request.body);
    if (userService) {
        let tmp = new model(body);
        await userService.trimDisabledField(body, ctx.user, model, tmp);
    }
    let record = new model(body);
    if (body.id) {
        record._id = body.id;
    }
    if (!ctx.state.ignoreAuthorization && model.api.create > alaska_1.PUBLIC) {
        if (!userService)
            model.service.error(401);
        if (!await userService.hasAbility(ctx.user, ability, record)) {
            model.service.error(ctx.user ? 403 : 401);
        }
    }
    await record.save({ session: ctx.dbSession });
    ctx.state.record = record;
    ctx.body = record.data('create');
    if (userService) {
        await userService.trimProtectedField(ctx.body, ctx.user, model, record);
    }
}
exports.create = create;
async function update(ctx) {
    const model = ctx.state.model;
    const ability = `${model.id}.update`;
    let filters = await model.createFiltersByContext(ctx);
    let record = await model.findById(ctx.state.id || ctx.params.id).where(filters).session(ctx.dbSession);
    if (!record) {
        return;
    }
    if (!ctx.state.ignoreAuthorization && model.api.update > alaska_1.PUBLIC) {
        if (!userService)
            model.service.error(401);
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
    await record.save({ session: ctx.dbSession });
    ctx.state.record = record;
    if (scope) {
        ctx.body = record.data(scope);
    }
    else {
        ctx.body = _.pick(record.data('update'), 'id', record.__modifiedPaths);
        delete record.__modifiedPaths;
    }
    if (userService) {
        await userService.trimProtectedField(ctx.body, ctx.user, model, record);
    }
}
exports.update = update;
async function updateMulti(ctx) {
    const model = ctx.state.model;
    const ability = `${model.id}.update`;
    let abilityFilters;
    if (!ctx.state.ignoreAuthorization && model.api.updateMulti > alaska_1.PUBLIC) {
        if (!userService)
            model.service.error(401);
        abilityFilters = await userService.createFilters(ctx.user, ability);
        if (!abilityFilters)
            model.service.error(ctx.user ? 403 : 401);
    }
    let filters = await model.createFiltersByContext(ctx);
    let body = Object.assign({}, ctx.state.body || ctx.request.body);
    if (userService) {
        await userService.trimDisabledField(body, ctx.user, model);
    }
    let res = await model.updateMany(utils_1.mergeFilters(filters, abilityFilters), body, { session: ctx.dbSession });
    ctx.body = {
        updated: res.nModified
    };
}
exports.updateMulti = updateMulti;
async function remove(ctx) {
    const model = ctx.state.model;
    const ability = `${model.id}.remove`;
    let filters = await model.createFiltersByContext(ctx);
    let record = await model.findById(ctx.state.id || ctx.params.id).where(filters).session(ctx.dbSession);
    if (!record) {
        ctx.body = {};
        return;
    }
    if (!ctx.state.ignoreAuthorization && model.api.update > alaska_1.PUBLIC) {
        if (!userService)
            model.service.error(401);
        if (!await userService.hasAbility(ctx.user, ability, record)) {
            model.service.error(ctx.user ? 403 : 401);
        }
    }
    await record.remove();
    ctx.body = {};
}
exports.remove = remove;
async function removeMulti(ctx) {
    const model = ctx.state.model;
    const ability = `${model.id}.remove`;
    let abilityFilters;
    if (!ctx.state.ignoreAuthorization && model.api.updateMulti > alaska_1.PUBLIC) {
        if (!userService)
            model.service.error(401);
        abilityFilters = await userService.createFilters(ctx.user, ability);
        if (!abilityFilters)
            model.service.error(ctx.user ? 403 : 401);
    }
    ctx.body = {};
    let filters = await model.createFiltersByContext(ctx);
    let res = await model.deleteMany(utils_1.mergeFilters(filters, abilityFilters)).session(ctx.dbSession);
    ctx.body = {
        removed: res.n
    };
}
exports.removeMulti = removeMulti;
async function watch(ctx) {
    const model = ctx.state.model;
    const ability = `${model.id}.read`;
    let abilityFilters;
    if (!ctx.state.ignoreAuthorization && model.api.updateMulti > alaska_1.PUBLIC) {
        if (!userService)
            model.service.error(401);
        abilityFilters = await userService.createFilters(ctx.user, ability);
        if (!abilityFilters)
            model.service.error(ctx.user ? 403 : 401);
    }
    let s = new stream.PassThrough();
    ctx.body = s;
    ctx.type = 'json';
    let filters = await model.createFiltersByContext(ctx);
    filters = utils_1.mergeFilters(filters, abilityFilters);
    let pipeline = [];
    if (filters) {
        let match = { $or: [utils_1.filtersToMatch(filters), { operationType: 'delete' }] };
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
            if (!data)
                return;
            let record = model.hydrate(data);
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
exports.watch = watch;
