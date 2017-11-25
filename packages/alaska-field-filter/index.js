'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class FilterField extends _alaska.Field {

  init() {
    // $Flow this.ref有可能为空
    let mRef = this.ref || _alaska2.default.error(`${this._model.path}.fields.${this.path}.ref not found`);
    let ref = '';
    if (mRef.isModel) {
      ref = mRef.path;
    } else if (ref[0] !== ':' && ref.indexOf('.') === -1) {
      ref = this._model.service.id + '.' + ref;
    }
    this.ref = mRef;

    let service = this._model.service;

    let field = this;
    this.underscoreMethod('filter', function () {
      let data = this.get(field.path);
      if (!data) return null;
      let modelPath = ref;
      if (ref[0] === ':') {
        modelPath = this.get(ref.substr(1));
        if (!modelPath) return null;
      }
      if (!modelPath) {
        return null;
      }
      if (!service.hasModel(modelPath)) return null;
      return service.getModel(modelPath).createFilters('', data);
    });
  }
}
exports.default = FilterField;
FilterField.plain = _mongoose2.default.Schema.Types.Mixed;
FilterField.viewOptions = ['ref'];
FilterField.defualtOptions = {
  view: 'FilterFieldView'
};