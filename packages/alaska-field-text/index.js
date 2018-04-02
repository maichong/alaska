'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

class TextFeild extends _alaska.Field {

  init() {
    if (this.match && !(this.match instanceof RegExp)) {
      throw new Error(`${this._model.modelName}.${this.path} field "match" option must be instance of RegExp`);
    }
  }

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
      //默认精确
      exact = filter.exact !== false && filter.exact !== 'false';
      inverse = filter.inverse && filter.inverse !== 'false';
    }
    let result;

    if (value) {
      if (exact) {
        result = value;
      } else {
        result = new RegExp(_alaska.utils.escapeRegExp(String(value)), 'i');
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
exports.default = TextFeild;
TextFeild.plain = String;
TextFeild.dbOptions = ['trim', 'match', 'lowercase', 'uppercase', 'maxlength', 'minlength'];
TextFeild.viewOptions = ['trim', 'match', 'lowercase', 'uppercase', 'maxlength', 'minlength', 'addonBefore', 'addonAfter', 'placeholder', 'multiLine', 'translate', function (options, field) {
  if (field.match) {
    options.match = field.match.toString();
  }
}];
TextFeild.defaultOptions = {
  cell: 'TextFieldCell',
  view: 'TextFieldView',
  filter: 'TextFieldFilter'
};