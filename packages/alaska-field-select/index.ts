import { Field } from 'alaska-model';

export default class SelectField extends Field {
  static fieldName = 'Select';
  static plain = String;
  static viewOptions = ['options', 'translate', 'checkbox', 'switch', 'multi'];
  static defaultOptions = {
    cell: 'SelectFieldCell',
    view: 'SelectFieldView',
    filter: 'SelectFieldFilter'
  };

  number: boolean;
  boolean: boolean;

  initSchema() {
    let schema = this._schema;
    if (this.number) {
      this.plain = Number;
    } else if (this.boolean) {
      this.plain = Boolean;
    } else {
      this.plain = String;
    }
    let options = {
      type: this.plain
    };
    [
      'get',
      'set',
      'default',
      'index',
      'unique',
      'text',
      'sparse',
      'required',
      'select'
    ].forEach((key) => {
      // @ts-ignore
      if (typeof this[key] !== 'undefined') {
        // @ts-ignore
        options[key] = this[key];
      }
    });

    schema.path(this.path, this.multi ? [options] : options);
  }

  parse(value: any): null | any {
    if (value === null || typeof value === 'undefined') {
      return null;
    }
    if (this.number) {
      value = parseInt(value);
      return Number.isNaN(value) ? null : value;
    } else if (this.boolean) {
      if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      }
      if (value === true || value === false) return value;
    } else {
      // string
      return String(value);
    }
    return null;
  }
}
