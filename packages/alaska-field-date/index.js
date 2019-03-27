"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
const moment = require("moment");
class DateField extends alaska_model_1.Field {
    init() {
        let field = this;
        this.underscoreMethod('format', function (format) {
            return moment(this.get(field.path)).format(format || field.format);
        });
    }
    parse(value) {
        let v = moment(value);
        return v.isValid() ? v : null;
    }
}
DateField.fieldName = 'Date';
DateField.plain = Date;
DateField.dbOptions = ['min', 'max', 'expires'];
DateField.viewOptions = ['min', 'max', 'format'];
DateField.defaultOptions = {
    format: 'YYYY-MM-DD',
    cell: 'DateFieldCell',
    view: 'DateFieldView',
    filter: 'DatetimeFieldFilter',
};
exports.default = DateField;
