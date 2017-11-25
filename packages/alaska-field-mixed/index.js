'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class MixedField extends _alaska.Field {}
exports.default = MixedField;
MixedField.plain = _mongoose2.default.Schema.Types.Mixed;
MixedField.defaultOptions = {
  cell: 'MixedFieldCell',
  view: 'MixedFieldView'
};