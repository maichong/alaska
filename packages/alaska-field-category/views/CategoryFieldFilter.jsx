// @flow

import React from 'react';
import PropTypes from 'prop-types';
import { api } from 'alaska-admin-view';
import MultiLevelSelect from './MultiLevelSelect';

type State = {
  value: any,
  inverse: boolean,
  error: string | boolean,
  options: Object[]
};

export default class CategoryFieldFilter extends React.Component<Alaska$view$Field$Filter$Props, State> {
  static contextTypes = {
    t: PropTypes.func
  };

  constructor(props: Alaska$view$Field$Filter$Props) {
    super(props);
    // $Flow
    let value: Object = props.value || {};
    if (typeof value !== 'object') {
      value = { value };
    }
    this.state = {
      value: value.value,
      inverse: value.inverse === true || value.inverse === 'true',
      error: value.value === undefined,
      options: []
    };
  }

  componentWillMount() {
    this.init();
  }

  componentWillReceiveProps(props: Alaska$view$Field$Filter$Props) {
    let { value } = props;
    if (value !== this.props.value) {
      if (typeof value !== 'object') {
        value = { value };
      }
      this.setState(value);
    }
  }

  init() {
    let { field, value } = this.props;
    // $Flow 下方做了判断，保证ref一定存在
    const ref: string = field.ref;
    if (!ref) return;
    let [refServiceId, refModelName] = ref.split('.');
    api('/api/relation')
      .param('service', refServiceId)
      .param('model', refModelName)
      .param('value', value)
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
    const { t } = this.context;
    let { className, field, onClose } = this.props;
    const {
      value, inverse, error, options
    } = this.state;
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
