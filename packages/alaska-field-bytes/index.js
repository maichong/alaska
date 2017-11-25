'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaskaFieldNumber = require('alaska-field-number');

var _alaskaFieldNumber2 = _interopRequireDefault(_alaskaFieldNumber);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class BytesField extends _alaskaFieldNumber2.default {}
exports.default = BytesField;
BytesField.plain = Number;
BytesField.options = ['min', 'max'];
BytesField.viewOptions = ['min', 'max', 'unit', 'size', 'precision'];
BytesField.defaultOptions = {
  view: 'BytesFieldView',
  cell: 'BytesFieldCell',
  filter: 'NumberFieldFilter',
  unit: 'B',
  precision: 2,
  size: 1024
};