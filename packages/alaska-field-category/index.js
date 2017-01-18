// @flow

import _ from 'lodash';
import RelationshipField from 'alaska-field-relationship';

export default class CategoryField extends RelationshipField {

  static views: Object = _.defaults({
    view: {
      name: 'CategoryFieldView',
      path: `${__dirname}/lib/view.js`
    },
    filter: {
      name: 'CategoryFieldFilter',
      path: `${__dirname}/lib/filter.js`
    }
  }, RelationshipField.views);

  static viewOptions:any[] = ['filters', 'service', 'model', 'multi', function (options, field) {
    let Model = field.ref;
    if (Model) {
      options.key = Model.key;
      options.title = Model.title;
    }
  }];
}
