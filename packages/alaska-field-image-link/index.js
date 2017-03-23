// @flow

import { Field } from 'alaska';

export default class ImageField extends Field {
  static plain = String;
  static viewOptions = ['multi', 'thumbSuffix', 'max', 'target', 'allowed'];
  static defaultOptions = {
    cell: 'ImageLinkFieldCell',
    view: 'ImageLinkFieldView',
    target: 'alaska-user.User.avatar',
    allowed: ['jpg', 'png', 'gif']
  };

  initSchema() {
    let schema = this._schema;
    if (this.multi) {
      this.dataType = Array;
    } else {
      this.dataType = String;
    }
    let options = {
      type: this.dataType
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
      if (this[key] !== undefined) {
        // $Flow
        options[key] = this[key];
      }
    });
    schema.path(this.path, options);
  }
}
