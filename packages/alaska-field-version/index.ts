import CacheDriver from 'alaska-cache';
import NumberField from 'alaska-field-number';

export default class VersionField extends NumberField {
  cache: any;
  path: any;
  key: string;

  init() {
    let field = this;
    let schema = this._schema;
    let model = this._model;

    if (!field.cache) throw new Error('Missing config [alaska-field-version.cache]');

    console.log('field.cache', field.cache);

    let cacheDriver = model.service.createDriver(field.cache) as CacheDriver<number>;
    let key: string = field.key || `${model.modelName}.${field.path}`;

    schema.pre('save', function (next: Function) {
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
