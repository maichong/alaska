"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
class CheckboxField extends alaska_model_1.Field {
    parse(value) {
        if (value === 'true') {
            value = true;
        }
        else if (value === 'false') {
            value = false;
        }
        if (value === true || value === false)
            return value;
        return null;
    }
}
CheckboxField.fieldName = 'Checkbox';
CheckboxField.plain = Boolean;
CheckboxField.viewOptions = ['labelPosition'];
CheckboxField.defaultOptions = {
    cell: 'CheckboxFieldCell',
    view: 'CheckboxFieldView',
    filter: 'CheckboxFieldFilter'
};
exports.default = CheckboxField;
