// @flow

import React from 'react';
import PropTypes from 'prop-types';
import Select from 'alaska-field-select/views/Select';
import { api } from 'alaska-admin-view';
import _ from 'lodash';

function getFilters(filters: Object) {
  if (!filters) return {};
  return _.reduce(filters, (res, value, key) => {
    if (!_.isString(value) || value[0] !== ':') {
      res[key] = value;
    }
    return res;
  }, {});
}

export default class RelationshipFieldFilter extends React.Component {

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
    value:string|number;
    inverse:boolean;
    error:boolean;
    options:Alaska$SelectField$option[]
  };

  constructor(props: Object) {
    super(props);
    let v = props.value || {};
    if (typeof v === 'string') {
      v = { value: v };
    }
    let value: Alaska$filter = v;
    this.state = {
      value: value.value === undefined ? '' : value.value,
      inverse: value.inverse || false,
      error: value.value === undefined,
      options: []
    };
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

  handleInverse = () => {
    this.setState({ inverse: !this.state.inverse }, () => this.handleBlur());
  };

  handleSearch = (keyword: string, callback: Function) => {
    let field = this.props.field;
    api('/api/relation')
      .param('service', field.service)
      .param('model', field.model)
      .param('value', field.value)
      .search(keyword)
      .where(getFilters(field.filters))
      .then((res) => {
        callback(null, { options: res.results });
      }, callback);
  };

  handleChange = (value: string) => {
    this.setState({ value }, () => this.handleBlur());
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
    const { value, inverse, error, options } = this.state;
    const buttonClassName = 'btn btn-default';
    const buttonClassNameActive = buttonClassName + ' btn-success';
    let className = 'row field-filter relationship-field-filter' + (error ? ' error' : '');
    return (
      <div className={className}>
        <label className="col-xs-2 control-label text-right">{t(field.label)}</label>
        <div className="form-inline col-xs-10">
          <div className="form-group" style={{ minWidth: 230 }}>
            <Select
              options={options}
              loadOptions={this.handleSearch}
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
