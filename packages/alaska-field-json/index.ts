import { Field } from 'alaska-model';
import * as mongoose from 'mongoose';

export default class JsonField extends Field {
  static fieldName = 'Json';
  static plain = mongoose.Schema.Types.String;
  static plainName = 'json';
  static viewOptions = ['codeMirrorOptions'];

  static defaultOptions = {
    cell: 'MixedFieldCell',
    view: 'MixedFieldView',
  };

  init() {
    this.get = function (json: string) {
      if (!json) return null;
      return JSON.parse(json);
    };

    this.set = function (object: any) {
      return JSON.stringify(object);
    };
  }
}
