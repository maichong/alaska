import TextField from 'alaska-field-text';

export default class CodeField extends TextField {
  static fieldName = 'Code';
  static viewOptions = ['codeMirrorOptions'];
  static defaultOptions = {
    cell: 'TextFieldCell',
    view: 'CodeFieldView',
    filter: 'TextFieldFilter'
  };
}
