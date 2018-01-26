'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const TypeObjectId = _mongoose2.default.Schema.Types.ObjectId;

const { ObjectId } = _mongoose2.default.Types;

class RelationshipField extends _alaska.Field {

  /**
   * 初始化Schema
   */
  initSchema() {
    let schema = this._schema;
    let model = this._model;
    let { dataType, ref } = this;
    if (dataType === 'ObjectId' || dataType === ObjectId) {
      dataType = TypeObjectId;
    }
    if (typeof ref === 'string') {
      //查找引用模型
      //ref 当this.optional为true时,ref有可能为null
      if (this.optional && !model.service.hasModel(ref)) {
        ref = null;
      } else {
        ref = model.service.getModel(ref);
      }
    }

    let options = {};
    let type;
    if (ref) {
      //找到了引用模型
      if (dataType) {
        type = dataType;
      } else if (ref.fields._id) {
        type = ref.fields._id;
        if (type.type) {
          // eslint-disable-next-line
          type = type.type;
        }
        if (typeof type === 'string') {
          let fieldLib = 'alaska-field-' + type;
          type = _alaska2.default.modules.fields[fieldLib];
          if (!type) {
            _alaska2.default.panic(`Field type '${fieldLib}' not found!`);
          }
        }
        if (type.plain) {
          type = type.plain;
        }
      }
      if (!type) {
        type = TypeObjectId;
      }
      options = {
        type,
        ref: ref.modelName
      };

      if (ref.service) {
        // 模型已经初始化
        this.service = ref.service.id;
      }
      this.model = ref.modelName;
    } else {
      //如果没有找到引用,说明是可选引用
      this.hidden = true;
      type = dataType || TypeObjectId;
      options.type = type;
      if (typeof this.ref === 'string') {
        let arr = this.ref.split('.');
        // eslint-disable-next-line prefer-destructuring
        this.model = arr[1];
        // eslint-disable-next-line prefer-destructuring
        this.service = arr[0];
      }
    }

    options.set = value => {
      if (value === '' && type === TypeObjectId) {
        return undefined;
      }
      // eslint-disable-next-line
      return value;
    };

    ['get', 'set', 'default', 'index', 'unique', 'text', 'sparse', 'required', 'select'].forEach(key => {
      if (this[key] !== undefined) {
        options[key] = this[key];
      }
    });

    // $Flow
    this.ref = ref;
    // $Flow
    this.dataType = type;
    // $Flow
    schema.path(this.path, this.multi ? [options] : options);

    if (ref === model) {
      let field = this;
      schema.pre('save', function (next) {
        let record = this;
        if (!record.isModified(field.path)) {
          next();
          return;
        }
        let { id } = record;
        if (id && String(id) === String(record.get(field.path))) {
          next(new Error('Can not relate to record self, ' + model.path + '#' + field.path));
          return;
        }
        next();
      });
    }
  }

  createFilter(filter) {
    let value = filter;
    let inverse = false;
    if (typeof filter === 'object' && filter.value) {
      if (filter.$ne) {
        return filter;
      }
      // eslint-disable-next-line prefer-destructuring
      value = filter.value;
      if (filter.inverse === true || filter.inverse === 'true') {
        inverse = true;
      }
    }

    if (this.dataType === TypeObjectId) {
      if (value instanceof ObjectId) {
        return value;
      }
      return inverse ? { $ne: value } : value;
    } else if (this.dataType === String) {
      if (typeof value !== 'string' && value.toString) {
        value = value.toString();
      }
      if (typeof value === 'string') {
        return inverse ? { $ne: value } : value;
      }
    } else if (this.dataType === Number) {
      value = parseInt(value);
      if (_lodash2.default.isNaN(value)) return null;
      return inverse ? { $ne: value } : value;
    }
    return null;
  }
}
exports.default = RelationshipField;
RelationshipField.plain = TypeObjectId;
RelationshipField.viewOptions = ['filters', 'multi', 'checkbox', 'switch', (options, field) => {
  let Model = field.ref;
  if (Model) {
    options.ref = Model.path;
    options.title = Model.titleField;
  }
}];
RelationshipField.defaultOptions = {
  cell: 'RelationshipFieldCell',
  view: 'RelationshipFieldView',
  filter: 'RelationshipFieldFilter',
  defaultValue: ''
};