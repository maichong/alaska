import ImageField from 'alaska-field-image';
import { ImageService } from 'alaska-image';

export default class ImageLinkField extends ImageField {
  static plain = String;
  static plainName = 'string';

  initSchema() {
    const field = this;
    const schema = this._schema;
    if (this.multi) {
      this.plain = Array;
      this.plainName = 'array';
    } else {
      this.plain = String;
      this.plainName = 'string';
    }

    let main = field._model.service.main;
    let imageService = main.allServices.get('alaska-image') as ImageService;
    if (imageService) {
      let driver = field.driver || 'default';
      if (!imageService.drivers.hasOwnProperty(driver)) throw new Error('Image storage driver not found!');
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
