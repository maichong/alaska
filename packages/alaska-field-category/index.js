'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaskaFieldRelationship = require('alaska-field-relationship');

var _alaskaFieldRelationship2 = _interopRequireDefault(_alaskaFieldRelationship);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class CategoryField extends _alaskaFieldRelationship2.default {}
exports.default = CategoryField;
CategoryField.viewOptions = ['filters', 'service', 'model', 'multi', function (options, field) {
  let Model = field.ref;
  if (Model) {
    options.ref = Model.path;
    options.title = Model.titleField;
  }
}];
CategoryField.defaultOptions = {
  cell: 'RelationshipFieldCell',
  view: 'CategoryFieldView',
  filter: 'CategoryFieldFilter'
};