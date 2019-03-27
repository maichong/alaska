"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const alaska_1 = require("alaska");
const __1 = require("../..");
class ChartPlugin extends alaska_1.Plugin {
    constructor(service) {
        super(service);
        service.post('settings', (res, settings) => {
            let model = _.get(settings, 'services.alaska-chart.models.Series');
            if (model) {
                __1.default.keyParsers.forEach((fn, key) => {
                    if (!_.find(model.fields.keyParser.options, ({ value }) => value === key)) {
                        model.fields.keyParser.options.push({ label: key, value: key });
                    }
                });
                __1.default.valueParsers.forEach((fn, key) => {
                    if (!_.find(model.fields.valueParser.options, ({ value }) => value === key)) {
                        model.fields.valueParser.options.push({ label: key, value: key });
                    }
                });
            }
        });
    }
}
exports.default = ChartPlugin;
