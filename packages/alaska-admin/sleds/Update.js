"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const alaska_sled_1 = require("alaska-sled");
const alaska_user_1 = require("alaska-user");
class Update extends alaska_sled_1.Sled {
    async exec(params) {
        let { body, records, admin, model } = params;
        let results = [];
        let { dbSession } = this;
        async function updateRecord(record, data) {
            data = _.omit(data, '_id', 'id');
            await alaska_user_1.default.trimDisabledField(data, admin, model, record);
            record.set(data);
            await record.save({ session: dbSession });
            let json = record.toJSON();
            await alaska_user_1.default.trimPrivateField(json, admin, model, record);
            results.push(json);
        }
        if (_.isArray(body)) {
            if (body.length !== records.length)
                this.service.error('Records count not match');
            let recordsMap = _.keyBy(records, 'id');
            for (let info of body) {
                let id = info.id;
                let record = recordsMap[id];
                if (!record)
                    continue;
                await updateRecord(record, info);
            }
        }
        else {
            for (let record of records) {
                await updateRecord(record, body);
            }
        }
        return results;
    }
}
exports.default = Update;
