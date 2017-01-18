// @flow

import alaska from 'alaska';
import NumberField from 'alaska-field-number';
import numeral from 'numeral';

class IIDField extends NumberField {

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
    let key = field.key || model.name + '.' + field.path;

    schema.pre('save', (next: Function): Function|void => {
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
      return () => {};
    });
  }
}

module.exports = IIDField;
