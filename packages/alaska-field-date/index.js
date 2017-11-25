'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DateField extends _alaska.Field {

  init() {
    let field = this;
    this.underscoreMethod('format', function (format) {
      return (0, _moment2.default)(this.get(field.path)).format(format || field.format);
    });
  }

  createFilter(filter) {
    if (!filter) return null;
    let value;

    //精确
    if (typeof filter === 'string' || filter instanceof Date) {
      value = filter;
    } else if (typeof filter === 'object' && filter.value) {
      value = filter.value;
    }
    if (value) {
      let date = (0, _moment2.default)(value);
      if (!date.isValid()) {
        return null;
      }
      let end = (0, _moment2.default)(date).endOf('day').toDate();
      let start = (0, _moment2.default)(date).startOf('day').toDate();
      return { $lte: end, $gte: start };
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
      let start = (0, _moment2.default)(bt[0]);
      let end = (0, _moment2.default)(bt[1]);
      if (start.isValid() && end.isValid()) {
        return {
          $gte: start.startOf('day').toDate(),
          $lte: end.endOf('day').toDate()
        };
      }
    }

    //比较
    ['gt', 'gte', 'lt', 'lte'].forEach(key => {
      let val = filter[key] || filter['$' + key];
      if (val) {
        if (!(val instanceof Date)) {
          val = (0, _moment2.default)(val);
          if (!val.isValid()) return;
          if (key[1] === 'g') {
            //$gt $gte
            val = val.startOf('day').toDate();
          } else {
            //$lt $lte
            val = val.endOf('day').toDate();
          }
        }
        if (!value) {
          value = {};
        }
        value['$' + key] = val;
      }
    });
    if (value) {
      return value;
    }
    return null;
  }
}
exports.default = DateField;
DateField.plain = Date;
DateField.dbOptions = ['min', 'max', 'expires'];
DateField.viewOptions = ['min', 'max', 'format'];
DateField.defaultOptions = {
  format: 'YYYY-MM-DD',
  cell: 'DateFieldCell',
  view: 'DateFieldView',
  filter: 'DatetimeFieldFilter'
};