"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
const alaska_user_1 = require("alaska-user");
const __1 = require("..");
function default_1(router) {
    router.get('/details', async (ctx) => {
        ctx.service = __1.default;
        ctx.state.adminApi = 'details';
        if (!ctx.state.ignoreAuthorization) {
            if (!await alaska_user_1.default.hasAbility(ctx.user, 'admin'))
                __1.default.error('Access Denied', 403);
        }
        const id = ctx.query._id || __1.default.error('Missing id!');
        const modelId = ctx.query._model || __1.default.error('Missing model!');
        const model = alaska_model_1.Model.lookup(modelId) || __1.default.error('Model not found!');
        let record = await model.findById(id);
        if (!record)
            __1.default.error('Record not found', 404);
        const ability = `${model.id}.read`;
        if (!ctx.state.ignoreAuthorization) {
            if (!await alaska_user_1.default.hasAbility(ctx.user, ability, record))
                __1.default.error('Access Denied', 403);
        }
        let json = record.toJSON();
        await alaska_user_1.default.trimPrivateField(json, ctx.user, model, record);
        ctx.body = json;
    });
}
exports.default = default_1;
