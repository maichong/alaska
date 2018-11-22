import TextField from 'alaska-field-text';

export default class HtmlField extends TextField {
  static fieldName = 'Html';
  static defaultOptions = {
    cell: 'HtmlFieldCell',
    view: 'HtmlFieldView',
    filter: 'TextFieldFilter',
  };
}
