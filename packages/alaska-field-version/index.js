'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

var _alaskaFieldNumber = require('alaska-field-number');

var _alaskaFieldNumber2 = _interopRequireDefault(_alaskaFieldNumber);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class VersionField extends _alaskaFieldNumber2.default {

  init() {
    let field = this;
    let schema = this._schema;
    let model = this._model;

    // $Flow
    let cacheDriver = _alaska2.default.main.createDriver(field.cache);
    let key = field.key || model.modelName + '.' + field.path;

    schema.pre('save', function (next) {
      let record = this;
      cacheDriver.inc(key).then(f => {
        record.set(field.path, f);
        next();
      }, error => {
        next(error);
      });
    });
  }
}
exports.default = VersionField;