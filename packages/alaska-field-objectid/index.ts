
import { Field } from 'alaska-model';
import * as mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

export default class ObjectIdField extends Field {
  static fieldName = 'ObjectId';
  static plain = mongoose.Schema.Types.ObjectId;
  static plainName = 'objectid';
  static defaultOptions = {
    cell: 'TextFieldCell',
    view: 'TextFieldView',
    filter: false,
  };

  parse(value: any): null | mongoose.Types.ObjectId {
    if (ObjectId.isValid(value)) {
      if (typeof value === 'object') {
        return value;
      }
      return new ObjectId(value);
    }
    return null;
  }
}
