"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alaska_model_1 = require("alaska-model");
function defaultFilters(ctx) {
    if (!ctx.state.superMode) {
        return {
            super: { $ne: true }
        };
    }
    return {};
}
class Settings extends alaska_model_1.Model {
}
Settings.label = 'Settings';
Settings.icon = 'cogs';
Settings.defaultSort = 'group service';
Settings.defaultColumns = '_id title group service';
Settings.filterFields = '@search';
Settings.searchFields = '_id title group help';
Settings.cache = 600;
Settings.defaultFilters = defaultFilters;
Settings.fields = {
    _id: {
        type: String
    },
    title: {
        label: 'Title',
        type: String
    },
    service: {
        label: 'Service',
        type: String
    },
    group: {
        label: 'Group',
        type: String
    },
    value: {
        label: 'Value',
        type: Object
    },
    help: {
        label: 'Help',
        type: String
    },
    type: {
        label: 'Type',
        type: 'select',
        default: 'MixedFieldView',
        options: [{
                label: 'Text',
                value: 'TextFieldView'
            }, {
                label: 'Number',
                value: 'NumberFieldView'
            }, {
                label: 'Checkbox',
                value: 'CheckboxFieldView'
            }, {
                label: 'Select',
                value: 'SelectFieldView'
            }, {
                label: 'Date',
                value: 'DateFieldView'
            }, {
                label: 'Datetime',
                value: 'DatetimeFieldView'
            }, {
                label: 'Mixed',
                value: 'MixedFieldView'
            }, {
                label: 'Html',
                value: 'HtmlFieldView'
            }, {
                label: 'Image',
                value: 'ImageFieldView'
            }, {
                label: 'File',
                value: 'FileFieldView'
            }]
    },
    super: {
        label: 'Super',
        type: Boolean
    },
    options: {
        label: 'Options',
        type: Object,
        default: {}
    }
};
exports.default = Settings;
