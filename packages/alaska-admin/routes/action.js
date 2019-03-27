"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const alaska_model_1 = require("alaska-model");
const alaska_sled_1 = require("alaska-sled");
const alaska_user_1 = require("alaska-user");
const __1 = require("..");
function default_1(router) {
    router.post('/action', async (ctx) => {
        ctx.service = __1.default;
        ctx.state.adminApi = 'action';
        if (!ctx.state.ignoreAuthorization) {
            if (!await alaska_user_1.default.hasAbility(ctx.user, 'admin'))
                __1.default.error('Access Denied', 403);
        }
        const body = ctx.request.body;
        let records = [];
        const recordsId = _.values(ctx.query._records || []);
        const modelId = ctx.query._model || __1.default.error('Missing model!');
        const actionName = ctx.query._action || __1.default.error('Missing action!');
        const model = alaska_model_1.Model.lookup(modelId) || __1.default.error('Model not found!');
        const action = model.actions[actionName] || __1.default.error('Action not found!');
        if (!action.sled)
            __1.default.error('Missing action sled');
        let sledId = action.sled;
        if (!sledId.includes('.')) {
            sledId = `${model.service.id}.${sledId}`;
        }
        const sled = alaska_sled_1.Sled.lookup(sledId) || __1.default.error('Action sled not found!');
        const ability = action.ability || `${model.id}.${actionName}`;
        if (!recordsId.length) {
            if (!ctx.state.ignoreAuthorization && !await alaska_user_1.default.hasAbility(ctx.user, ability))
                __1.default.error('Access Denied', 403);
        }
        else {
            records = await model.find({ _id: { $in: recordsId } }).session(ctx.dbSession);
            if (recordsId.length !== records.length)
                __1.default.error('Record not found!');
            if (!ctx.state.ignoreAuthorization) {
                for (let record of records) {
                    if (!await alaska_user_1.default.hasAbility(ctx.user, ability, record))
                        __1.default.error('Access Denied', 403);
                }
            }
        }
        let result = await sled.run({
            ctx,
            admin: ctx.user,
            model,
            records,
            record: records[0],
            body: body
        }, { dbSession: ctx.dbSession });
        if (typeof result !== 'undefined') {
            ctx.body = result;
        }
    });
}
exports.default = default_1;
