// @flow

import TextField from 'alaska-field-text';

export default class IconField extends TextField {
  static defaultOptions = {
    cell: 'IconFieldView',
    view: 'IconFieldCell',
    filter: 'TextFieldFilter',
  };
}
