// @flow

import { Field } from 'alaska';
import mongoose from 'mongoose';

const TypeObjectId = mongoose.Schema.Types.ObjectId;

export default class IDField extends Field {
  static plain = TypeObjectId;
  static defaultOptions = {
    cell: 'TextFieldCell',
    view: 'TextFieldView',
    filter: false,
  };

  createFilter(filter: Object) {
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
    return inverse ? { $ne: value } : value;
  }
}
