import { Field } from 'alaska-model';
import * as mongoose from 'mongoose';

export default class MixedField extends Field {
  static fieldName = 'Mixed';
  static plain = mongoose.Schema.Types.Mixed;
  static plainName = 'mixed';
  static viewOptions = ['codeMirrorOptions'];

  static defaultOptions = {
    cell: 'MixedFieldCell',
    view: 'MixedFieldView',
  };
}
