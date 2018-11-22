import NumberField from 'alaska-field-number';

export default class BytesField extends NumberField {
  static plain = Number;
  static options = ['min', 'max'];
  static viewOptions = ['min', 'max', 'unit', 'size', 'precision'];
  static defaultOptions = {
    view: 'BytesFieldView',
    cell: 'BytesFieldCell',
    filter: 'NumberFieldFilter',
    unit: 'B',
    precision: 2,
    size: 1024
  };
}
