// @flow

import { utils, Field } from 'alaska';

export default class HtmlField extends Field {
  static plain = String;
  static viewOptions = ['upload', 'defaultImage'];
  static defaultOptions = {
    cell: 'HtmlFieldCell',
    view: 'HtmlFieldView',
    filter: 'TextFieldFilter',
  };

  createFilter(filter: Object) {
    if (filter instanceof RegExp) {
      return filter;
    }
    let exact = true;
    let inverse = false;
    let value = filter;
    if (typeof filter === 'object') {
      if (filter.$not || filter.$in || filter.$nin) {
        return filter;
      }
      value = filter.value;
      exact = filter.exact !== false && filter.exact !== 'false';
      inverse = filter.inverse === true || filter.inverse === 'true';
    }
    let result;

    if (value) {
      if (exact) {
        result = value;
      } else {
        result = new RegExp(utils.escapeRegExp(value), 'i');
      }
      if (inverse) {
        result = { $not: result };
      }
    } else if (inverse) {
      result = { $nin: ['', null] };
    } else {
      result = { $in: ['', null] };
    }
    return result;
  }
}
