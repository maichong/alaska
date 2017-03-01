// @flow

import { Field } from 'alaska';
import mongoose from 'mongoose';

export default class MixedField extends Field {
  static plain = mongoose.Schema.Types.Mixed;
  static defaultOptions = {
    cell: 'MixedFieldCell',
    view: 'MixedFieldView',
  };
}
