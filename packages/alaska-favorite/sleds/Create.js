"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_sled_1 = require("alaska-sled");
const Favorite_1 = require("../models/Favorite");
const __1 = require("..");
class Create extends alaska_sled_1.Sled {
    async exec(params) {
        if (this.result)
            return this.result;
        let { title, pic, type, user } = params;
        if (!user)
            __1.default.error('missing favorite user!');
        if (!type)
            __1.default.error('missing favorite type!');
        if (!params[type])
            __1.default.error('missing favorite target!');
        let Model = __1.default.types.get(type);
        if (Model) {
            let fav = await Favorite_1.default.findOne({ user, type, [type]: params[type] }).session(this.dbSession);
            if (fav)
                return fav;
        }
        if (!pic || !title && Model) {
            let record = await Model.findById(params[type]).session(this.dbSession);
            if (!record)
                __1.default.error(`Favorite target not found`);
            if (!title) {
                let titleField = Model.titleField || '';
                params.title = record.get(titleField);
            }
            if (!pic) {
                params.pic = record.get('pic');
            }
            if (type === 'goods') {
                params.shop = record.shop;
                params.brand = record.brand;
            }
            else if (type === 'shop') {
                params.brand = record.brand;
            }
        }
        let record = new Favorite_1.default(params);
        await record.save({ session: this.dbSession });
        return record;
    }
}
exports.default = Create;
