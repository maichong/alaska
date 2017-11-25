'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _alaska = require('alaska');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class SelectField extends _alaska.Field {

  initSchema() {
    let schema = this._schema;
    if (this.multi) {
      this.dataType = Array;
    } else if (this.number) {
      this.dataType = Number;
    } else if (this.boolean) {
      this.dataType = Boolean;
    } else {
      this.dataType = String;
    }
    let options = {
      type: this.dataType
    };
    ['get', 'set', 'default', 'index', 'unique', 'text', 'sparse', 'required', 'select'].forEach(key => {
      if (this[key] !== undefined) {
        // $Flow
        options[key] = this[key];
      }
    });

    schema.path(this.path, options);
  }

  createFilter(filter) {
    let value = filter;
    let inverse = false;
    if (typeof filter === 'object' && filter.value) {
      if (filter.$ne) {
        return filter;
      }
      value = filter.value;
      if (filter.inverse === true || filter.inverse === 'true') {
        inverse = true;
      }
    }
    if (this.number) {
      value = parseInt(value);
      if (_lodash2.default.isNaN(value)) return null;
      return inverse ? { $ne: value } : value;
    }
    if (this.boolean) {
      value = value && (value === true || value === 'true');
      return inverse ? { $ne: value } : value;
    }
    if (typeof value !== 'string' && value.toString) {
      value = value.toString();
    }
    if (typeof value === 'string') {
      return inverse ? { $ne: value } : value;
    }
    return null;
  }
}
exports.default = SelectField;
SelectField.plain = String;
SelectField.viewOptions = ['options', 'translate', 'checkbox', 'switch', 'multi'];
SelectField.defaultOptions = {
  cell: 'SelectFieldCell',
  view: 'SelectFieldView',
  filter: 'SelectFieldFilter'
};