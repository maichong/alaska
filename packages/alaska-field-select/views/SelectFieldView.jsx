// @flow

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import shallowEqualWithout from 'shallow-equal-without';
import checkDepends from 'check-depends';
import Select from './Select';
import SelectCheckbox from './SelectCheckbox';
import Switch from './Switch';
import { getOptionValue } from './utils';

export default class SelectFieldView extends React.Component {

  static contextTypes = {
    t: PropTypes.func,
  };

  props: {
    className: string,
    model: Object,
    field: Object,
    data: Object,
    errorText: string,
    disabled: boolean,
    value: any,
    onChange: Function,
  };

  state = {};

  componentWillMount() {
    this.setState({
      options: this.filter(this.props.field.options, this.props.data)
    });
  }

  componentWillReceiveProps(nextProps: Object) {
    if (nextProps.field !== this.props.field || nextProps.data !== this.props.data) {
      this.setState({
        options: this.filter(nextProps.field.options, nextProps.data)
      });
    }
  }

  shouldComponentUpdate(props: Object, state: Object) {
    return !shallowEqualWithout(props, this.props, 'data', 'onChange', 'model') || state !== this.state;
  }

  t(opt: Alaska$SelectField$option) {
    const t = this.context.t;
    if (this.props.field.translate === false || !t) {
      return opt;
    }
    return {
      label: t(opt.label, this.props.model.serviceId),
      value: opt.value,
      style: opt.style
    };
  }

  filter(options: Alaska$SelectField$option[], data: Object) {
    if (!options || !data || !options.length) {
      return options;
    }
    let res = [];
    _.forEach(options, (opt) => {
      if (checkDepends(opt.depends, data)) {
        res.push(this.t(opt));
      }
    });
    return res;
  }

  render() {
    let { className, field, value, disabled, errorText, onChange } = this.props;
    let View = Select;
    if (field.checkbox) {
      View = SelectCheckbox;
    } else if (field.switch) {
      View = Switch;
    }
    if (field.multi) {
      if (!_.isArray(value)) {
        value = [value];
      }
      value = _.filter(value, (v) => v !== undefined && v !== null);
    }
    let help = field.help;
    className += ' select-field';
    if (errorText) {
      className += ' has-error';
      help = errorText;
    }
    let helpElement = help ? <p className="help-block">{help}</p> : null;
    let inputElement;
    if (field.fixed) {
      if (field.multi) {
        let elements = [];
        let valueMap = {};
        _.forEach(value, (v) => (valueMap[getOptionValue(v)] = true));
        _.forEach(this.state.options, (opt) => {
          if (valueMap[String(opt.value)]) {
            elements.push(<span key={opt.value}>{opt.label || opt.value}</span>);
          }
        });
        inputElement = elements;
      } else {
        let option = _.find(this.state.options, (opt) => opt.value === value);
        inputElement = option ? option.label : value;
      }
      inputElement = <p className="form-control-static">{inputElement}</p>;
    } else {
      inputElement = <View
        value={value}
        multi={field.multi}
        disabled={disabled}
        options={this.state.options}
        onChange={onChange}
      />;
    }

    let label = field.nolabel ? '' : field.label;

    if (field.horizontal === false) {
      let labelElement = label ? <label className="control-label">{label}</label> : null;
      return (
        <div className={className}>
          {labelElement}
          {inputElement}
          {helpElement}
        </div>
      );
    }

    return (
      <div className={className}>
        <label className="col-sm-2 control-label">{label}</label>
        <div className="col-sm-10">
          {inputElement}
          {helpElement}
        </div>
      </div>
    );
  }
}
