// @flow

import NumberField from 'alaska-field-number';

export default class BytesField extends NumberField {
  static plain: any = Number;
  static options: string[] = ['min', 'max'];
  static viewOptions: void | Array<string|(options: Object, field: Alaska$Field)=>void> = [
    'min', 'max', 'unit', 'size', 'precision'
  ];
  static defaultOptions = {
    view: 'BytesFieldView',
    cell: 'BytesFieldCell',
    filter: 'NumberFieldFilter',
    unit: 'B',
    precision: 2,
    size: 1024
  };
}
