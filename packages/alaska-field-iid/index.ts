import NumberField from 'alaska-field-number';
import CacheDriver, { CacheDriverOptions } from 'alaska-cache';

export default class IIDField extends NumberField {
  static fieldName = 'iid';
  static defaultOptions = {
    cell: 'NumberFieldCell',
    view: 'IIDFieldView',
    filter: 'NumberFieldFilter',
  };

  cache: CacheDriverOptions;
  key: string;

  init() {
    let field = this;
    let schema = this._schema;
    let model = this._model;
    let service = model.service;
    this.underscoreMethod('format', function (format: string) {
      if (format) {
        return numeral(this.get(field.path)).format(format);
      }
      return this.get(field.path);
    });

    if (!field.cache) throw new Error(`Missing iid field cache config`);

    let cacheDriver = service.createDriver(field.cache) as CacheDriver<number>;
    let key: string = field.key || `${model.modelName}.${field.path}`;

    schema.pre('save', function (next: Function) {
      let record = this;
      let value = record.get(field.path);
      if (value) {
        next();
        return;
      }
      cacheDriver.inc(key).then((f) => {
        record.set(field.path, f);
        next();
      }, (error) => {
        next(error);
      });
    });
  }
}
