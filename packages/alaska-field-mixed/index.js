// @flow

import { Field } from 'alaska';
import mongoose from 'mongoose';

export default class MixedField extends Field {
  static views: Object = {
    cell: {
      name: 'MixedFieldCell',
      path: `${__dirname}/lib/cell.js`
    },
    view: {
      name: 'MixedFieldView',
      path: `${__dirname}/lib/view.js`
    }
  };

  static plain = mongoose.Schema.Types.Mixed;
}
