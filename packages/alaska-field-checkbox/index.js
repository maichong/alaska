// @flow

import { Field } from 'alaska';

export default class CheckboxField extends Field {

  static plain = Boolean;
  static viewOptions = ['labelPosition'];
  static defaultOptions = {
    cell: 'CheckboxFieldCell',
    view: 'CheckboxFieldView',
    filter: 'CheckboxFieldFilter'
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

