// @flow

import { Field } from 'alaska';
import moment from 'moment';

export default class DateField extends Field {
  static plain = Date;
  static dbOptions = ['min', 'max', 'expires'];
  static viewOptions = ['min', 'max', 'format'];
  static defaultOptions = {
    format: 'YYYY-MM-DD',
    cell: 'DateFieldCell',
    view: 'DateFieldView',
    filter: 'DatetimeFieldFilter',
  };

  format: string;

  init() {
    let field = this;
    this.underscoreMethod('format', function (format) {
      return moment(this.get(field.path)).format(format || field.format);
    });
  }

  createFilter(filter: Object): any {
    if (!filter) return null;
    let value;

    //精确
    if (typeof filter === 'string' || filter instanceof Date) {
      value = filter;
    } else if (typeof filter === 'object' && filter.value) {
      value = filter.value;
    }
    if (value) {
      let date = moment(value);
      if (!date.isValid()) {
        return null;
      }
      let end = moment(date).endOf('day').toDate();
      let start = moment(date).startOf('day').toDate();
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
      let start = moment(bt[0]);
      let end = moment(bt[1]);
      if (start.isValid() && end.isValid()) {
        return {
          $gte: start.startOf('day').toDate(),
          $lte: end.endOf('day').toDate()
        };
      }
    }

    //比较
    ['gt', 'gte', 'lt', 'lte'].forEach((key) => {
      let val = filter[key] || filter['$' + key];
      if (val) {
        if (!(val instanceof Date)) {
          val = moment(val);
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
