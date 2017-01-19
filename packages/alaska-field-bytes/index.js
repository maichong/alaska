// @flow

import NumberField from 'alaska-field-number';

export default class BytesField extends NumberField {
  static views: Object = {
    cell: {
      name: 'BytesFieldCell',
      path: `${__dirname}/lib/cell.js`
    },
    view: {
      name: 'BytesFieldView',
      path: `${__dirname}/lib/view.js`
    }
  };

  static plain: any = Number;
  static options: string[] = ['min', 'max'];
  static viewOptions: Array<string|(options: Object, field: Alaska$Field)=>void> = [
    'min', 'max', 'unit', 'size', 'precision'
  ];
  unit: ?string;
  precision: ?number;
  size: ?number;

  init() {
    let field = this;
    if (!field.filter && field.filter !== false) {
      field.filter = 'NumberFieldFilter';
    }
    if (!field.unit && field.unit !== '') {
      field.unit = 'B';
    }
    if (!field.precision && field.precision !== 0) {
      field.precision = 2;
    }
    if (!field.size) {
      field.size = 1024;
    }
  }
}
