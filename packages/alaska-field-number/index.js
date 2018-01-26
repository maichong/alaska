'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _numeral = require('numeral');

var _numeral2 = _interopRequireDefault(_numeral);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class NumberField extends _alaska.Field {

  init() {
    let field = this;
    this.underscoreMethod('format', function (format) {
      if (format) {
        return (0, _numeral2.default)(this.get(field.path)).format(format);
      }
      return this.get(field.path);
    });
  }

  createFilter(filter) {
    let value;
    if (typeof filter === 'object') {
      value = filter.value;
    } else if (typeof filter === 'number' || typeof filter === 'string') {
      value = filter;
    }
    if (value !== undefined) {
      let v = parseFloat(value);
      return _lodash2.default.isNaN(v) ? undefined : v;
    }

    //区间
    let bt;
    if (filter instanceof Array) {
      bt = filter;
    } else if (filter.$bt && filter.$bt instanceof Array) {
      bt = filter.$bt;
    } else if (filter.bt && filter.bt instanceof Array) {
      bt = filter.bt;
    }
    if (bt && bt.length === 2) {
      let start = parseFloat(bt[0]);
      let end = parseFloat(bt[1]);
      if (_lodash2.default.isNaN(start) || _lodash2.default.isNaN(end)) return null;
      return { $gte: start, $lte: end };
    }

    //比较
    ['gt', 'gte', 'lt', 'lte'].forEach(key => {
      let val = filter[key] || filter['$' + key];
      if (val === undefined) return;
      val = parseFloat(val);
      if (_lodash2.default.isNaN(val)) return;
      if (!value) {
        value = {};
      }
      value['$' + key] = val;
    });

    if (value !== undefined) {
      return value;
    }

    return null;
  }
}
exports.default = NumberField;
NumberField.plain = Number;
NumberField.dbOptions = ['min', 'max'];
NumberField.viewOptions = ['min', 'max', 'format', 'addonBefore', 'addonAfter', 'placeholder'];
NumberField.defaultOptions = {
  cell: 'NumberFieldCell',
  view: 'NumberFieldView',
  filter: 'NumberFieldFilter',
  format: '0,0'
};