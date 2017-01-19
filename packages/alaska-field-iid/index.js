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

    let cacheDriver = alaska.main.createCacheDriver(field.cache);
    let key:string = field.key || model.name + '.' + field.path;

    schema.pre('save', (next: Function): Function|void => {
      let record = this;
      // $Flow record确认会有值
      let value = record.get(field.path);
      if (value) {
        return next();
      }
      cacheDriver.inc(key).then((f) => {
        // $Flow record确认会有值
        record.set(field.path, f);
        next();
      }, (error) => {
        next(error);
      });
      return () => {};
    });
  }
}
