// @flow

import { Field } from 'alaska';
import path from 'path';

export default class SelectField extends Field {

  static plain = String;
  static viewOptions = ['options', 'translate', 'checkbox', 'switch', 'multi'];
  static views = {
    cell: {
      name: 'SelectFieldCell',
      path: path.join(__dirname, 'views/cell.js')
    },
    view: {
      name: 'SelectFieldView',
      path: path.join(__dirname, 'views/view.js')
    },
    filter: {
      name: 'SelectFieldFilter',
      path: path.join(__dirname, 'views/filter.js')
    }
  };

  number: boolean;
  boolean: boolean;
  dataType: Function;

  initSchema() {
    let schema = this._schema;
    if (this.multi) {
      this.dataType = Array;
    } else if (this.number) {
      this.dataType = Number;
    } else if (this.boolean) {
      this.dataType = Boolean;
    } else {
      this.dataType = String;
    }
    let options = {
      type: this.dataType
    };
    [
      'get',
      'set',
      'default',
      'index',
      'unique',
      'text',
      'sparse',
      'required',
      'select'
    ].forEach((key) => {
      if (this[key] !== undefined) {
        // $Flow
        options[key] = this[key];
      }
    });

    // $Flow
    schema.path(this.path, options);
  }

  createFilter(filter: Object): any|void {
    let value = filter;
    let inverse = false;
    if (typeof filter === 'object' && filter.value) {
      value = filter.value;
      if (filter.inverse === true || filter.inverse === 'true') {
        inverse = true;
      }
    }
    if (this.number) {
      value = parseInt(value);
      if (isNaN(value)) return undefined;
      return inverse ? { $ne: value } : value;
    }
    if (this.boolean) {
      value = value && (value === true || value === 'true');
      return inverse ? { $ne: value } : value;
    }
    if (typeof value !== 'string' && value.toString) {
      value = value.toString();
    }
    if (typeof value === 'string') {
      return inverse ? { $ne: value } : value;
    }
    return undefined;
  }
}
