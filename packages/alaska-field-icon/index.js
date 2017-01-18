// @flow

import TextField from 'alaska-field-text';

export default class IconField extends TextField {
  static views: Object = {
    view: {
      name: 'IconFieldView',
      path: `${__dirname}/lib/view.js`
    },
    cell: {
      name: 'IconFieldCell',
      path: `${__dirname}/lib/cell.js`
    },
    filter: TextField.views.filter
  };
}
