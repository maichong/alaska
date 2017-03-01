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
    let exact = true;
    let inverse = false;
    let value = filter;
    if (typeof filter === 'object') {
      value = filter.value;
      exact = filter.exact !== false && filter.exact !== 'false';
      inverse = filter.inverse === true || filter.inverse === 'true';
    }
    let result;

    if (value) {
      if (exact) {
        result = new RegExp('^' + utils.escapeRegExp(value) + '$', 'i');
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
