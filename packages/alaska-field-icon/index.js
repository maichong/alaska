'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaskaFieldText = require('alaska-field-text');

var _alaskaFieldText2 = _interopRequireDefault(_alaskaFieldText);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class IconField extends _alaskaFieldText2.default {}
exports.default = IconField;
IconField.defaultOptions = {
  cell: 'IconFieldCell',
  view: 'IconFieldView',
  filter: 'TextFieldFilter'
};