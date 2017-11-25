// @flow

import alaska from 'alaska';
import NumberField from 'alaska-field-number';

export default class VersionField extends NumberField {
  cache: any;
  path: any;
  key: string;

  init() {
    let field = this;
    let schema = this._schema;
    let model = this._model;

    // $Flow
    let cacheDriver: Alaska$CacheDriver = (alaska.main.createDriver(field.cache): Alaska$CacheDriver);
    let key: string = field.key || model.modelName + '.' + field.path;

    schema.pre('save', function (next: Function): Function | void {
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
