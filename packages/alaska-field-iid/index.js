// @flow

import alaska from 'alaska';
import NumberField from 'alaska-field-number';
import numeral from 'numeral';

export default class IIDField extends NumberField {
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

    // $Flow
    let cacheDriver: Alaska$CacheDriver = (alaska.main.createDriver(field.cache): Alaska$CacheDriver);
    let key: string = field.key || model.modelName + '.' + field.path;

    schema.pre('save', function (next: Function): Function | void {
      let record = this;
      let value = record.get(field.path);
      if (value) {
        return next();
      }
      cacheDriver.inc(key).then((f) => {
        record.set(field.path, f);
        next();
      }, (error) => {
        next(error);
      });
      return () => {
      };
    });
  }
}
