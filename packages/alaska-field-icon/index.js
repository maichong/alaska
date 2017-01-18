// @flow

import TextField from 'alaska-field-text';

class IconField extends TextField {

}

IconField.views = {
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

module.exports = IconField;
