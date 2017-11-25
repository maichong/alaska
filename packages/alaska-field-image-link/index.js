'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

class ImageField extends _alaska.Field {

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
    ['get', 'set', 'default', 'index', 'unique', 'text', 'sparse', 'required', 'select'].forEach(key => {
      if (this[key] !== undefined) {
        // $Flow
        options[key] = this[key];
      }
    });
    schema.path(this.path, options);
  }
}
exports.default = ImageField;
ImageField.plain = String;
ImageField.viewOptions = ['multi', 'thumbSuffix', 'max', 'target', 'allowed'];
ImageField.defaultOptions = {
  cell: 'ImageLinkFieldCell',
  view: 'ImageLinkFieldView',
  target: 'alaska-user.User.avatar',
  allowed: ['jpg', 'png', 'gif']
};