import { Model } from 'alaska-model';
import RelationshipField from 'alaska-field-relationship';

export default class CategoryField extends RelationshipField {
  static fieldName = 'Category';
  static viewOptions = ['filters', 'multi',
    (options: any, field: CategoryField) => {
      let ref = field.ref;
      if (ref && ref.classOfModel) {
        options.ref = (<typeof Model>ref).id;
        options.title = (<typeof Model>ref).titleField;
      }
    }];

  static defaultOptions = {
    cell: 'RelationshipFieldCell',
    view: 'CategoryFieldView',
    filter: 'CategoryFieldFilter',
    defaultValue: ''
  };
}
