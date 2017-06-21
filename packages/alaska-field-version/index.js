// @flow

import alaska from 'alaska';
import NumberField from 'alaska-field-number';
import numeral from 'numeral';

export default class VersionField extends NumberField {
  cache: any;
  path: any;
  key: string;

  init() {
    let field = this;
    let schema = this._schema;
    let model = this._model;
    this.underscoreMethod('format', function (format) {
      if (format) {
        return numeral(this.get(field.path)).format(format);
      }
      return this.get(field.path);
    });

    let cacheDriver = alaska.main.getCacheDriver(field.cache);
    let key: string = field.key || model.name + '.' + field.path;

    schema.pre('save', function (next: Function): Function|void {
      let record = this;
      cacheDriver.inc(key).then((f) => {
        record.set(field.path, f);
        next();
      }, (error) => {
        next(error);
      });
    });
  }
}
