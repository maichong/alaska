"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const moment = require("moment");
const alaska_sled_1 = require("alaska-sled");
const alaska_settings_1 = require("alaska-settings");
const __1 = require("..");
class Ship extends alaska_sled_1.Sled {
    async exec(params) {
        if (this.result)
            return this.result;
        if (!params.record && _.isEmpty(params.records))
            throw new Error('record or records is required');
        let records = _.size(params.records) ? params.records : [params.record];
        if (_.find(records, (o) => ![300, 400].includes(o.state)))
            __1.default.error('Order state error');
        let expressCompany = params.expressCompany || _.get(params, 'body.expressCompany');
        let expressCode = params.expressCode || _.get(params, 'body.expressCode');
        const expressCompanyService = __1.default.lookup('alaska-express-company');
        for (let order of records) {
            if (expressCompany) {
                order.expressCompany = expressCompany;
            }
            if (expressCode) {
                order.expressCode = expressCode;
            }
            if (expressCompanyService) {
                if (!order.expressCompany) {
                    if (!expressCompany)
                        __1.default.error('Express company is required');
                    order.expressCompany = expressCompany;
                }
                if (!order.expressCode) {
                    if (!expressCode)
                        __1.default.error('Express code is required');
                    order.expressCode = expressCode;
                }
            }
            order.state = 500;
            if (!order.receiveTimeout) {
                let receiveTimeout = await alaska_settings_1.default.get('order.receiveTimeout');
                if (receiveTimeout) {
                    order.receiveTimeout = moment().add(receiveTimeout, 's').toDate();
                }
            }
            order.shipped = true;
            await order.save({ session: this.dbSession });
            order.createLog('Order shipped', this.dbSession);
        }
        return records;
    }
}
exports.default = Ship;
