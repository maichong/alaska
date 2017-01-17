// @flow

import alaska, { Field } from 'alaska';

const mongoose = require('mongoose');

class FilterField extends Field {
  init() {
    // $Flow this.ref有可能为空
    let mRef:Class<Alaska$Model> = this.ref || alaska.error(`${this._model.path}.fields.${this.path}.ref not found`);
    let ref:string = '';
    if (mRef.isModel) {
      ref = mRef.path;
    } else if (ref[0] !== ':' && ref.indexOf('.') === -1) {
      ref = this._model.service.id + '.' + ref;
    }
    this.ref = mRef;

    let service = this._model.service;

    let field = this;
    this.underscoreMethod('filter', function () {
      let data = this.get(field.path);
      if (!data) return null;
      let modelPath = ref;
      if (ref[0] === ':') {
        modelPath = this.get(ref.substr(1));
        if (!modelPath) return null;
      }
      if (!modelPath) {
        return null;
      }
      let Model = service.model(modelPath, true);
      if (!Model) return null;
      return Model.createFilters('', data);
    });
  }
}

FilterField.views = {
  view: {
    name: 'FilterFieldView',
    path: `${__dirname}/lib/view.js`
  }
};

FilterField.plain = mongoose.Schema.Types.Mixed;

FilterField.viewOptions = ['ref'];

module.exports = FilterField;
