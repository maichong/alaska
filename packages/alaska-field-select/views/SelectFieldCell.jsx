// @flow

import React from 'react';
import _ from 'lodash';
import { getOptionValue } from './utils';

const { func } = React.PropTypes;

export default class SelectFieldCell extends React.Component {

  static contextTypes = {
    t: func
  };

  props: {
    value: any,
    field: Object,
    model: Object,
  };

  shouldComponentUpdate(props: Object) {
    /* eslint eqeqeq:0 */
    return props.value != this.props.value;
  }

  render() {
    const t = this.context.t;
    let { field, value, model } = this.props;
    let el;

    if (field.multi) {
      el = [];
      let valueMap = {};
      _.forEach(value, (v) => (valueMap[getOptionValue(v)] = true));
      _.forEach(field.options, (opt) => {
        if (valueMap[opt.value]) {
          let label = opt.label || opt.value;
          if (field.translate !== false) {
            label = t(label, model.serviceId);
          }
          if (el.length) {
            el.push(' , ');
          }
          el.push(<span key={opt.value}>{label}</span>);
        }
      });
    } else {
      let option = _.find(field.options, (opt) => opt.value === value);
      el = option ? option.label : value;
      if (field.translate !== false) {
        el = t(el, model.serviceId);
      }
    }
    return <div className="select-field-cell">{el}</div>;
  }
}
