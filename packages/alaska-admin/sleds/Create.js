"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_sled_1 = require("alaska-sled");
const alaska_user_1 = require("alaska-user");
const __1 = require("..");
class Create extends alaska_sled_1.Sled {
    async exec(params) {
        const model = params.model;
        const body = params.body;
        let tmp = new model(body);
        await alaska_user_1.default.trimDisabledField(body, params.admin, model, tmp);
        let record = new model(body);
        let ability = `${model.id}.create`;
        if (!params.ctx.state.ignoreAuthorization) {
            if (!await alaska_user_1.default.hasAbility(params.ctx.user, ability, record))
                __1.default.error('Access Denied', 403);
        }
        await record.save({ session: this.dbSession });
        let json = record.toJSON();
        await alaska_user_1.default.trimPrivateField(json, params.admin, model, record);
        return json;
    }
}
exports.default = Create;
