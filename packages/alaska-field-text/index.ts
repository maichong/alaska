
import { Field } from 'alaska-model';

export default class TextFeild extends Field {
  static fieldName = 'Text';
  static plain = String;
  static dbOptions = ['trim', 'match', 'lowercase', 'uppercase', 'maxlength', 'minlength'];
  static viewOptions = [
    'trim', 'match', 'lowercase', 'uppercase', 'maxlength', 'minlength',
    'addonBefore', 'addonAfter', 'placeholder', 'multiLine', 'translate',
    function (options: any, field: Field) {
      if (field.match) {
        options.match = field.match.toString();
      }
    }
  ];

  static defaultOptions = {
    cell: 'TextFieldCell',
    view: 'TextFieldView',
    filter: 'TextFieldFilter',
  };

  init() {
    if (this.match && !(this.match instanceof RegExp)) {
      throw new Error(`${this._model.modelName}.${this.path} field "match" option must be instance of RegExp`);
    }
  }

  parse(value: any): null | string {
    if (typeof value === 'string') {
      return value;
    } else if (value === null || typeof value === 'undefined') {
      return null;
    }
    return String(value);
  }
}
