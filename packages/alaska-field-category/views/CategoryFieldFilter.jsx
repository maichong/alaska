// @flow

import React from 'react';
import PropTypes from 'prop-types';
import { api } from 'alaska-admin-view';
import MultiLevelSelect from './MultiLevelSelect';

export default class CategoryFieldFilter extends React.Component {
  static contextTypes = {
    t: PropTypes.func
  };

  props: {
    className: string,
    value: any,
    field: Object,
    onChange: Function,
    onClose: Function
  };

  state: {
    value: any,
    inverse: boolean,
    error: string|boolean,
    options: Object[]
  };

  constructor(props: Object) {
    super(props);
    let value: string|Object = props.value || {};
    if (typeof value === 'string') {
      value = { value, inverse: false };
    }
    this.state = {
      value: value.value,
      inverse: value.inverse,
      error: value.value === undefined,
      options: []
    };
  }

  componentWillMount() {
    this.init();
  }

  componentWillReceiveProps(props: Object) {
    if (props.value !== this.props.value) {
      let value = props.value;
      if (typeof value === 'string') {
        value = { value };
      }
      this.setState(value);
    }
  }

  init() {
    let field = this.props.field;
    api('/api/relation')
      .param('service', field.service)
      .param('model', field.model)
      .param('value', field.value)
      .where(field.filters || {})
      .then((res) => {
        this.setState({ options: res.results });
      });
  }

  handleInverse = () => {
    this.setState({ inverse: !this.state.inverse }, () => this.handleBlur());
  };

  handleChange = (value: any) => {
    this.setState({ value }, this.handleBlur);
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
    let { className, field, onClose } = this.props;
    const { value, inverse, error, options } = this.state;
    const buttonClassName = 'btn btn-default';
    const buttonClassNameActive = buttonClassName + ' btn-success';
    className += ' category-field-filter' + (error ? ' error' : '');
    return (
      <div className={className}>
        <label className="col-xs-2 control-label text-right">{field.label}</label>
        <div className="col-xs-10">
          <MultiLevelSelect
            options={options}
            value={value}
            onChange={this.handleChange}
          />
          <a
            className={inverse ? buttonClassNameActive : buttonClassName}
            onClick={this.handleInverse}
          >{t('inverse')}
          </a>
        </div>
        <a className="btn field-filter-close" onClick={onClose}><i className="fa fa-close" /></a>
      </div>
    );
  }
}
