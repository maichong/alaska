"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const alaska_model_1 = require("alaska-model");
const utils_1 = require("alaska-model/utils");
const alaska_user_1 = require("alaska-user");
const __1 = require("..");
function default_1(router) {
    router.get('/list', async (ctx) => {
        ctx.state.adminApi = 'list';
        ctx.service = __1.default;
        if (!ctx.state.ignoreAuthorization) {
            if (!await alaska_user_1.default.hasAbility(ctx.user, 'admin'))
                __1.default.error('Access Denied', 403);
        }
        const modelId = ctx.query._model || __1.default.error('Missing model!');
        const model = alaska_model_1.Model.lookup(modelId) || __1.default.error('Model not found!');
        const ability = `${model.id}.read`;
        let abilityFilters;
        if (!ctx.state.ignoreAuthorization) {
            abilityFilters = await alaska_user_1.default.createFilters(ctx.user, ability);
            if (!abilityFilters)
                __1.default.error('Access Denied', 403);
        }
        let filters = utils_1.mergeFilters(await model.createFiltersByContext(ctx), abilityFilters);
        let query = model.paginate(filters)
            .page(parseInt(ctx.state.page || ctx.query._page, 10) || 1)
            .limit(parseInt(ctx.state.limit || ctx.query._limit, 10) || model.defaultLimit || 50);
        let sort = ctx.state.sort || ctx.query._sort || model.defaultSort;
        if (sort) {
            query.sort(sort);
        }
        let populations = ctx.state.populations || ctx.query._populations;
        _.forEach(populations, (field) => {
            query.populate(field);
        });
        let result = await query;
        let list = [];
        for (let record of result.results) {
            let json = record.toJSON();
            list.push(json);
            await alaska_user_1.default.trimPrivateField(json, ctx.user, model, record);
        }
        ctx.body = _.assign({}, result, { results: list });
    });
}
exports.default = default_1;
