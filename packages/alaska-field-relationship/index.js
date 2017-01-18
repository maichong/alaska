// @flow

/* eslint global-require:0 */
/* eslint import/no-dynamic-require:0 */

import { Field } from 'alaska';
import mongoose from 'mongoose';
import path from 'path';

const TypeObjectId = mongoose.Schema.Types.ObjectId;
const ObjectId = mongoose.Types.ObjectId;

export default class RelationshipField extends Field {

  static plain = TypeObjectId;
  static viewOptions = ['filters', 'service', 'model', 'multi', 'checkbox', 'switch', function (options, field) {
    let Model = field.ref;
    if (Model) {
      options.key = Model.key;
      options.title = Model.title;
    }
  }];
  static views = {
    cell: {
      name: 'RelationshipFieldCell',
      path: path.join(__dirname, 'lib/cell.js')
    },
    view: {
      name: 'RelationshipFieldView',
      path: path.join(__dirname, 'lib/view.js')
    },
    filter: {
      name: 'RelationshipFieldFilter',
      path: path.join(__dirname, 'lib/filter.js')
    }
  };

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
      ref = model.service.model(this.ref, this.optional);
    }

    let options;
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
          type = require('alaska-field-' + type);
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

    if (this.multi) {
      options = [options];
    }
    this.ref = ref;
    this.dataType = type;
    schema.path(this.path, options);
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
      if (isNaN(value)) return undefined;
      return inverse ? { $ne: value } : value;
    }
    return undefined;
  }
}
