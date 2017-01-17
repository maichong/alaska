// @flow

import { Field } from 'alaska';
import path from 'path';

export default class CheckboxField extends Field {

  static plain = Boolean;
  static viewOptions = ['labelPosition'];
  static views = {
    cell: {
      name: 'CheckboxFieldCell',
      path: path.join(__dirname, 'views/cell.js')
    },
    view: {
      name: 'CheckboxFieldView',
      path: path.join(__dirname, 'views/view.js')
    },
    filter: {
      name: 'CheckboxFieldFilter',
      path: path.join(__dirname, 'views/filter.js')
    }
  };

  createFilter(filter: Object): any|void {
    let value = filter;
    if (typeof filter === 'object') {
      if (filter.$ne === true) {
        //已经处理过的filter
        return { $ne: true };
      }
      value = filter.value;
    }
    return (!value || value === 'false') ? { $ne: true } : true;
  }
}

