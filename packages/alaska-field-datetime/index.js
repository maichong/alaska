"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
const moment = require("moment");
class DatetimeField extends alaska_model_1.Field {
    init() {
        let field = this;
        this.underscoreMethod('format', function (format) {
            return moment(this.get(field.path)).format(format || field.format);
        });
    }
    parseFilter(value) {
        let str = String(value);
        if (/^\d+$/.test(str)) {
            if (str.length === 4) {
                let date = moment(`${str}0201`);
                if (date.isValid()) {
                    return {
                        $gte: date.startOf('year').toISOString(),
                        $lte: date.endOf('year').toISOString()
                    };
                }
            }
            if (str.length === 6) {
                let date = moment(`${str}02`);
                if (date.isValid()) {
                    return {
                        $gte: date.startOf('month').toISOString(),
                        $lte: date.endOf('month').toISOString()
                    };
                }
            }
            if (str.length === 8) {
                let date = moment(str);
                if (date.isValid()) {
                    return {
                        $gte: date.startOf('day').toISOString(),
                        $lte: date.endOf('day').toISOString()
                    };
                }
            }
        }
        return this.parse(value);
    }
    parse(value) {
        let v = moment(value);
        return v.isValid() ? v : null;
    }
}
DatetimeField.fieldName = 'Datetime';
DatetimeField.plain = Date;
DatetimeField.dbOptions = ['min', 'max', 'expires'];
DatetimeField.viewOptions = ['min', 'max', 'format', 'dateFormat', 'timeFormat'];
DatetimeField.defaultOptions = {
    format: 'YYYY-MM-DD HH:mm:ss',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm:ss',
    cell: 'DatetimeFieldCell',
    view: 'DatetimeFieldView',
    filter: 'DatetimeFieldFilter',
};
exports.default = DatetimeField;
