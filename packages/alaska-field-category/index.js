// @flow

import RelationshipField from 'alaska-field-relationship';

export default class CategoryField extends RelationshipField {
  static viewOptions = ['filters', 'service', 'model', 'multi', function (options: Object, field: Alaska$Field) {
    let Model = field.ref;
    if (Model) {
      options.ref = Model.path;
      options.title = Model.title;
    }
  }];
  static defaultOptions = {
    cell: 'RelationshipFieldCell',
    view: 'CategoryFieldView',
    filter: 'CategoryFieldFilter',
  };
}
