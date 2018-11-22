import { Field } from 'alaska-model';
import * as numeral from 'numeral';

export default class NumberField extends Field {
  static fieldName = 'Number';
  static plain = Number;
  static dbOptions = ['min', 'max'];
  static viewOptions = ['min', 'max', 'format', 'addonBefore', 'addonAfter', 'placeholder'];
  static defaultOptions = {
    cell: 'NumberFieldCell',
    view: 'NumberFieldView',
    filter: 'NumberFieldFilter',
    format: '0,0'
  };

  init() {
    let field = this;
    this.underscoreMethod('format', function (format: string) {
      if (format) {
        return numeral(this.get(field.path)).format(format);
      }
      return this.get(field.path);
    });
  }

  parse(value: any): null | number {
    if (value === null || typeof value === 'undefined') {
      return null;
    }
    value = parseFloat(value);
    return Number.isNaN(value) ? null : value;
  }
}
