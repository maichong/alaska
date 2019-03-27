"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_field_relationship_1 = require("alaska-field-relationship");
class CategoryField extends alaska_field_relationship_1.default {
}
CategoryField.fieldName = 'Category';
CategoryField.viewOptions = ['multi',
    (options, field) => {
        let ref = field.ref;
        if (ref && ref.classOfModel) {
            options.ref = ref.id;
            options.title = ref.titleField;
        }
    }];
CategoryField.defaultOptions = {
    cell: 'RelationshipFieldCell',
    view: 'CategoryFieldView',
    filter: 'RelationshipFieldFilter',
};
exports.default = CategoryField;
