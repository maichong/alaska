'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

var _alaskaFieldNumber = require('alaska-field-number');

var _alaskaFieldNumber2 = _interopRequireDefault(_alaskaFieldNumber);

var _numeral = require('numeral');

var _numeral2 = _interopRequireDefault(_numeral);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class IIDField extends _alaskaFieldNumber2.default {

  init() {
    let field = this;
    let schema = this._schema;
    let model = this._model;
    this.underscoreMethod('format', function (format) {
      if (format) {
        return (0, _numeral2.default)(this.get(field.path)).format(format);
      }
      return this.get(field.path);
    });

    // $Flow
    let cacheDriver = _alaska2.default.main.createDriver(field.cache);
    let key = field.key || model.modelName + '.' + field.path;

    schema.pre('save', function (next) {
      let record = this;
      let value = record.get(field.path);
      if (value) {
        return next();
      }
      cacheDriver.inc(key).then(f => {
        record.set(field.path, f);
        next();
      }, error => {
        next(error);
      });
      return () => {};
    });
  }
}
exports.default = IIDField;