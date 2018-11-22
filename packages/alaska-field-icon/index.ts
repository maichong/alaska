import TextField from 'alaska-field-text';

export default class IconField extends TextField {
  static fieldName = 'Icon';
  static defaultOptions = {
    cell: 'IconFieldCell',
    view: 'IconFieldView',
    filter: 'TextFieldFilter',
  };
}
