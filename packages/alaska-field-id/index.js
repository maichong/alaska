'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const TypeObjectId = _mongoose2.default.Schema.Types.ObjectId;
const ObjectId = _mongoose2.default.Types.ObjectId;

class IDField extends _alaska.Field {

  createFilter(filter) {
    let value = filter;
    let inverse = false;
    if (typeof filter === 'object' && filter.value) {
      if (filter.$ne) {
        return filter;
      }
      value = filter.value;
      if (filter.inverse === true || filter.inverse === 'true') {
        inverse = true;
      }
    }
    if (value instanceof ObjectId) {
      return value;
    }
    return inverse ? { $ne: value } : value;
  }
}
exports.default = IDField;
IDField.plain = TypeObjectId;
IDField.defaultOptions = {
  cell: 'TextFieldCell',
  view: 'TextFieldView',
  filter: 'TextFieldFilter'
};