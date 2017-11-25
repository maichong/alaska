'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

class Settings extends _alaska.Model {}
exports.default = Settings;
Settings.label = 'Settings';
Settings.icon = 'cogs';
Settings.defaultSort = 'group service';
Settings.defaultColumns = '_id title group service';
Settings.cache = 600;

Settings.defaultFilters = ctx => {
  if (!ctx.state.superMode) {
    return { super: { $ne: true } };
  }
  return {};
};

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
    type: Object,
    default: null
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