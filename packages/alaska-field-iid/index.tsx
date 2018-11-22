import NumberField from 'alaska-field-number';

export default class IIDField extends NumberField {
  static fieldName = 'iid';
  static defaultOptions = {
    cell: 'NumberFieldCell',
    view: 'IIDFieldView',
    filter: 'NumberFieldFilter',
  };
}
