'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

class CheckboxField extends _alaska.Field {

  createFilter(filter) {
    let value = filter;
    if (typeof filter === 'object') {
      if (filter.$ne === true) {
        //已经处理过的filter
        return { $ne: true };
      }
      value = filter.value;
    }
    return !value || value === 'false' ? { $ne: true } : true;
  }
}
exports.default = CheckboxField;
CheckboxField.plain = Boolean;
CheckboxField.viewOptions = ['labelPosition'];
CheckboxField.defaultOptions = {
  cell: 'CheckboxFieldCell',
  view: 'CheckboxFieldView',
  filter: 'CheckboxFieldFilter'
};