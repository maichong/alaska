// @flow

/* eslint eqeqeq:0 */

import React from 'react';
import Checkbox from 'alaska-field-checkbox/views/Checkbox';
import _ from 'lodash';
import { getOptionValue } from './utils';

export default class SelectCheckbox extends React.Component {
  props: {
    disabled?: boolean,
    multi?: boolean,
    onChange: Function,
    loadOptions?: Function,
    value: any,
    options: Object[]
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
      props.loadOptions('', (error, res) => {
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

  handleCheck(opt: string) {
    const { value, multi, onChange } = this.props;
    const { options } = this.state;

    let optionsMap: Indexed = {};
    _.forEach(options, (o) => (optionsMap[getOptionValue(o)] = o));

    if (!multi) {
      if (optionsMap[opt]) {
        return onChange(optionsMap[opt].value);
      }
      return onChange(opt);
    }

    //multi
    if (!value || !value.length) {
      onChange([opt]);
      return null;
    }

    let res = [];
    let found = false;
    _.forEach(value, (v) => {
      let vid = getOptionValue(v);
      if (vid === opt) {
        found = true;
      } else if (optionsMap[vid]) {
        res.push(vid);
      }
    });
    if (!found) {
      res.push(opt);
    }
    return onChange(res);
  }

  render() {
    const { multi, value, disabled } = this.props;
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
        _.map(options, (opt) => {
          let vid = getOptionValue(opt);
          let className = '';
          if (opt.style) {
            className = 'text-' + opt.style;
          }
          return (<Checkbox
            key={vid}
            className={className}
            disabled={disabled}
            radio={!multi}
            label={opt.label}
            value={
              multi ? valueMap[vid] : (opt.value == value || opt == value || opt.value == value.value)
            }
            style={{ display: 'inline-block', marginRight: 16 }}
            onCheck={() => this.handleCheck(vid)}
          />)
        })
      }</div>
    );
  }
}
