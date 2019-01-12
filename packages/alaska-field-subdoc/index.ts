import { Field } from 'alaska-model';
import * as mongoose from 'mongoose';

export default class SubdocField extends Field {
  static fieldName = 'Mixed';
  static plain = mongoose.Schema.Types.Embedded;
  static plainName = 'subdoc';
  static viewOptions = ['codeMirrorOptions', 'multi'];

  static defaultOptions = {
    filter: '',
    cell: '',
    view: 'SubdocFieldView',
  };

  initSchema() {
    const schema = this._schema;
    let { ref } = this;
    if (!ref) throw new Error('Invalid subdoc ref!');
    let refSchema = ref.schema;
    if (!refSchema) {
      refSchema = new mongoose.Schema({});
      schema.path(this.path, this.multi ? [refSchema] : refSchema);
      // Ref Model 尚未初始化，待 Ref Model 初始化后，再获取其 schema
      ref.post('register', () => {
        this.initSchema();
      });
      return;
    }

    schema.path(this.path, this.multi ? [refSchema] : refSchema);
  }
}
