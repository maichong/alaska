// @flow

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Select from './Select';
import SelectCheckbox from './SelectCheckbox';
import Switch from './Switch';
import { getOptionValue } from './utils';

export default class SelectFieldFilter extends React.Component {

  static contextTypes = {
    t: PropTypes.func,
  };

  props: {
    value: any,
    field: Object,
    onChange: Function,
    onClose: Function,
  };

  state: {
    value: any,
    inverse: boolean,
    error: boolean
  };

  constructor(props: Object) {
    super(props);
    let u = props.value || {};
    if (typeof u === 'string') {
      u = { value: u };
    }
    let value: Alaska$filter = u;
    this.state = {
      value: value.value,
      inverse: value.inverse === true || value.inverse === 'true',
      error: value.value === undefined
    };
  }

  t(opt: Alaska$SelectField$option) {
    const t = this.context.t;
    if (this.props.field.translate === false || !t) {
      return opt;
    }
    return {
      label: t(opt.label),
      value: opt.value,
      style: opt.style
    };
  }

  handleInverse = () => {
    this.setState({ inverse: !this.state.inverse }, () => this.handleBlur());
  };

  handleChange = (option: Alaska$SelectField$option) => {
    this.setState({ value: getOptionValue(option) }, () => this.handleBlur());
  };

  handleBlur = () => {
    let { value, inverse } = this.state;
    if (value === undefined) {
      this.setState({ error: true });
      return;
    }
    this.setState({ error: false });

    this.props.onChange(inverse ? { value, inverse } : value);
  };

  render() {
    const t = this.context.t;
    const { field, onClose } = this.props;
    const { value, inverse, error } = this.state;
    const buttonClassName = 'btn btn-default';
    const buttonClassNameActive = buttonClassName + ' btn-success';
    let className = 'row field-filter select-field-filter' + (error ? ' error' : '');
    let View = Select;
    if (field.checkbox) {
      View = SelectCheckbox;
    } else if (field.switch) {
      View = Switch;
    }
    return (
      <div className={className}>
        <label className="col-xs-2 control-label text-right">{field.label}</label>
        <div className="form-inline col-xs-10">
          <div className="form-group" style={{ minWidth: 230 }}>
            <View
              options={_.map(field.options, (opt) => this.t(opt))}
              value={value}
              onChange={this.handleChange}
            />
          </div>
          <a
            className={inverse ? buttonClassNameActive : buttonClassName}
            onClick={this.handleInverse}
          >{t('inverse')}</a>
        </div>
        <a className="btn field-filter-close" onClick={onClose}><i className="fa fa-close" /></a>
      </div>
    );
  }
}
