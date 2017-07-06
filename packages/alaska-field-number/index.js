// @flow

import { Field } from 'alaska';
import numeral from 'numeral';

export default class NumberField extends Field {
  static plain = Number;
  static dbOptions = ['min', 'max'];
  static viewOptions = ['min', 'max', 'format', 'addonBefore', 'addonAfter', 'placeholder'];
  static defaultOptions = {
    cell: 'NumberFieldCell',
    view: 'NumberFieldView',
    filter: 'NumberFieldFilter',
  };

  init() {
    let field = this;
    this.underscoreMethod('format', function (format) {
      if (format) {
        return numeral(this.get(field.path)).format(format);
      }
      return this.get(field.path);
    });
  }

  createFilter(filter: Object): any {
    let value;
    if (typeof filter === 'object') {
      value = filter.value;
    } else if (typeof filter === 'number' || typeof filter === 'string') {
      value = filter;
    }
    if (value !== undefined) {
      let v = parseFloat(value);
      return isNaN(v) ? undefined : v;
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
      if (isNaN(start) || isNaN(end)) return null;
      return { $gte: start, $lte: end };
    }

    //比较
    ['gt', 'gte', 'lt', 'lte'].forEach((key) => {
      let val = filter[key] || filter['$' + key];
      if (val === undefined) return;
      val = parseFloat(val);
      if (isNaN(val)) return;
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
