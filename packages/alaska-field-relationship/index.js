// @flow

/* eslint global-require:0 */
/* eslint import/no-dynamic-require:0 */

import { Field } from 'alaska';
import mongoose from 'mongoose';

const TypeObjectId = mongoose.Schema.Types.ObjectId;
const ObjectId = mongoose.Types.ObjectId;

export default class RelationshipField extends Field {

  static plain = TypeObjectId;
  static viewOptions = ['filters', 'service', 'model', 'multi', 'checkbox', 'switch', function (options, field) {
    let Model = field.ref;
    if (Model) {
      options.ref = Model.path;
      options.title = Model.title;
    }
  }];
  static defaultOptions = {
    cell: 'RelationshipFieldCell',
    name: 'RelationshipFieldView',
    filter: 'RelationshipFieldFilter'
  };

  service: string;
  model: string;
  ref: void| Class<Alaska$Model>;
  optional: boolean;

  /**
   * 初始化Schema
   */
  initSchema() {
    let schema = this._schema;
    let model = this._model;
    let dataType = this.dataType;
    if (dataType === 'ObjectId' || dataType === ObjectId) {
      dataType = TypeObjectId;
    }
    let ref = this.ref;
    if (typeof ref === 'string') {
      //查找引用模型
      //ref 当this.optional为true时,ref有可能为null
      ref = model.service.model(ref, this.optional);
    }

    let options: Indexed = {};
    let type;
    if (ref) {
      //找到了引用模型
      if (dataType) {
        type = dataType;
      } else if (ref.fields._id) {
        type = ref.fields._id;
        if (type.type) {
          type = type.type;
        }
        if (typeof type === 'string') {
          // $Flow
          type = require('alaska-field-' + type).default;
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
        ref: ref.name
      };

      this.service = ref.service.id;
      this.model = ref.name;
    } else {
      //如果没有找到引用,说明是可选引用
      this.hidden = true;
      type = dataType || TypeObjectId;
      options = type;
      if (typeof this.ref === 'string') {
        let arr = this.ref.split('.');
        this.model = arr[1];
        this.service = arr[0];
      }
    }

    [
      'get',
      'set',
      'default',
      'index',
      'unique',
      'text',
      'sparse',
      'required',
      'select'
    ].forEach((key) => {
      if (this[key] !== undefined) {
        options[key] = this[key];
      }
    });

    this.ref = ref;
    // $Flow
    this.dataType = type;
    schema.path(this.path, this.multi ? [options] : options);

    let field = this;
    schema.pre('save', function (next) {
      let record = this;
      if (!record.isModified(field.path)) {
        next();
        return;
      }
      let id = record.id;
      if (id && String(id) == String(record.get(field.path))) {
        next(new Error('Can not relate to record self, ' + model.path + '#' + field.path));
        return;
      }
      next();
    });
  }

  createFilter(filter: Object): any {
    let value = filter;
    let inverse = false;
    if (typeof filter === 'object' && filter.value) {
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
      if (isNaN(value)) return null;
      return inverse ? { $ne: value } : value;
    }
    return null;
  }
}
