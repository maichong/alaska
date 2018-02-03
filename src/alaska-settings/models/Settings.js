// @flow

import { Model } from 'alaska';

export default class Settings extends Model<Settings> {
  static label = 'Settings';
  static icon = 'cogs';
  static defaultSort = 'group service';
  static defaultColumns = '_id title group service';
  static cache = 600; //缓存10分钟

  static defaultFilters = (ctx: Alaska$Context) => {
    if (!ctx.state.superMode) {
      return { super: { $ne: true } };
    }
    return {};
  };

  static fields = {
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
  _id: string | number | Object | any;
  title: string;
  service: string;
  group: string;
  value: Object;
  help: string;
  type: string;
  super: boolean;
  options: Object;
}
