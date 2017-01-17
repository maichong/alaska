// @flow

/* eslint eqeqeq:0 */

import React from 'react';
import Check from 'alaska-field-checkbox/views/Checkbox';
import _ from 'lodash';
import { getOptionValue } from './utils';

const { any, array, bool, func } = React.PropTypes;

export default class Checkbox extends React.Component {
  static propTypes = {
    multi: bool,
    onChange: func,
    loadOptions: func,
    value: any,
    options: array
  };

  state: {
    options:Alaska$SelectField$option[]
  };

  constructor(props: Object) {
    super(props);
    this.state = {
      options: props.options
    };
  }

  componentWillMount() {
    let props = this.props;
    if (props.loadOptions && (!props.options || !props.options.length)) {
      this.props.loadOptions('', (error, res) => {
        if (!error && res.options) {
          this.setState({ options: res.options });
        }
      });
    }
  }

  componentWillReceiveProps(props: Object) {
    this.setState({
      options: props.options
    });
  }

  handleCheck(opt: Alaska$SelectField$option) {
    const { multi, onChange, value } = this.props;
    const { options } = this.state;
    let valueStr = String(opt.value);
    if (!multi) {
      let valueId = getOptionValue(value);
      if (valueId != valueStr) {
        onChange(opt);
      }
      return;
    }

    //multi
    if (!value || !value.length) {
      onChange([opt]);
      return;
    }

    let optionsMap: Indexed = {};
    _.forEach(options, (o) => (optionsMap[getOptionValue(o)] = true));

    let res = [];
    let found = false;

    _.forEach(value, (v) => {
      if (!v) return;
      let vid = getOptionValue(v);
      if (vid == valueStr) {
        found = true;
      } else if (optionsMap[vid]) {
        res.push(v);
      }
    });

    if (!found) {
      res.push(opt);
    }
    onChange(res);
  }

  render() {
    const { multi, value } = this.props;
    const { options } = this.state;
    let valueMap: Indexed = {};
    if (multi) {
      _.forEach(value, (v) => {
        if (!v) return;
        v = String(v.value ? v.value : v);
        valueMap[v] = true;
      });
    }

    return (
      <div>{
        _.map(options, (opt, key) => (<Check
          key={key}
          radio={!multi}
          label={opt.label}
          value={
            multi ? valueMap[getOptionValue(opt)] : (opt.value == value || opt == value || opt.value == value.value)
          }
          style={{ display: 'inline-block', marginRight: 16 }}
          onCheck={() => this.handleCheck(opt)}
        />))
      }</div>
    );
  }
}
