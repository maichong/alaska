import SelectField from 'alaska-field-select';

export default class ModelField extends SelectField {
  static fieldName = 'Model';
  static plain = String;
  static viewOptions = ['checkbox', 'switch', 'multi'];
  static defaultOptions = {
    cell: '',
    view: 'ModelFieldView',
    filter: ''
  };
}
