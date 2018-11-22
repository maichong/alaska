import { Field } from 'alaska-model';

export default class CheckboxField extends Field {
  static fieldName = 'Checkbox';
  static plain = Boolean;
  static viewOptions = ['labelPosition'];
  static defaultOptions = {
    cell: 'CheckboxFieldCell',
    view: 'CheckboxFieldView',
    filter: 'CheckboxFieldFilter'
  };

  parse(value: any): any {
    if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    }
    if (value === true || value === false) return value;
    return null;
  }
}

