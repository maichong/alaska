'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

class HtmlField extends _alaska.Field {

  createFilter(filter) {
    if (filter instanceof RegExp) {
      return filter;
    }
    let exact = true;
    let inverse = false;
    let value = filter;
    if (typeof filter === 'object') {
      if (filter.$not || filter.$in || filter.$nin) {
        return filter;
      }
      value = filter.value;
      exact = filter.exact !== false && filter.exact !== 'false';
      inverse = filter.inverse === true || filter.inverse === 'true';
    }
    let result;

    if (value) {
      if (exact) {
        result = value;
      } else {
        result = new RegExp(_alaska.utils.escapeRegExp(value), 'i');
      }
      if (inverse) {
        result = { $not: result };
      }
    } else if (inverse) {
      result = { $nin: ['', null] };
    } else {
      result = { $in: ['', null] };
    }
    return result;
  }
}
exports.default = HtmlField;
HtmlField.plain = String;
HtmlField.viewOptions = ['upload', 'defaultImage'];
HtmlField.defaultOptions = {
  cell: 'HtmlFieldCell',
  view: 'HtmlFieldView',
  filter: 'TextFieldFilter'
};