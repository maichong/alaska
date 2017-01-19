// @flow

import React from 'react';
import Select from 'alaska-field-select/views/Select';
import { api, PREFIX } from 'alaska-admin-view';
import qs from 'qs';

const { object, any, func } = React.PropTypes;

export default class RelationshipFieldFilter extends React.Component {

  static propTypes = {
    value: any,
    field: object,
    onChange: func,
    onClose: func,
  };

  static contextTypes = {
    t: func,
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
    let query = qs.stringify({
      service: field.service,
      model: field.model,
      search: keyword,
      filters: field.filters,
      value: this.state.value
    });
    api.post(PREFIX + '/api/relation?' + query).then((res) => {
      callback(null, { options: res.results });
    }, callback);
  };

  handleChange = (option: Alaska$SelectField$option) => {
    // $Flow
    this.setState({ value: option ? option.value : undefined }, () => this.handleBlur());
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
        <label className="col-xs-2 control-label text-right">{field.label}</label>
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