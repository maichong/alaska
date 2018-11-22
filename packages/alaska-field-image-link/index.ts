import ImageField from 'alaska-field-image';

export default class ImageLinkField extends ImageField {
  static plain = String;
  static plainName = 'string';
  // static viewOptions = ['multi', 'thumbSuffix', 'max', 'allowed'];
  // static defaultOptions = {
  //   cell: 'ImageLinkFieldCell',
  //   view: 'ImageLinkFieldView',
  //   pathFormat: 'YYYY/MM/DD/',
  //   thumbSuffix: '',
  //   allowed: ['jpg', 'png', 'gif'],
  //   adapter: 'fs'
  // };

  initSchema() {
    let schema = this._schema;
    if (this.multi) {
      this.plain = Array;
      this.plainName = 'array';
    } else {
      this.plain = String;
      this.plainName = 'string';
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
    schema.path(this.path, options);
  }
}
