// @flow

import { Field } from 'alaska';
import mongoose from 'mongoose';

const TypeObjectId = mongoose.Schema.Types.ObjectId;
const ObjectId = mongoose.Types.ObjectId;

export default class IDField extends Field {
  static plain = TypeObjectId;

  init() {
    let field = this;
    if (!field.filter && field.filter !== false) {
      field.filter = 'TextFieldFilter';
    }
    if (!field.cell && field.cell !== false) {
      field.cell = 'TextFieldCell';
    }
    if (!field.view && field.view !== false) {
      field.view = 'TextFieldView';
    }
  }

  createFilter(filter: Object) {
    let value = filter;
    let inverse = false;
    if (typeof filter === 'object' && filter.value) {
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
