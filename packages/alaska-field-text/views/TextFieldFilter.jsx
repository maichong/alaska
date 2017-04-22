// @flow

import React from 'react';
import PropTypes from 'prop-types';

export default class TextFieldFilter extends React.Component {

  static contextTypes = {
    t: PropTypes.func,
  };

  props: {
    className: string,
    value: any,
    field: Object,
    onChange: Function,
    onClose: Function,
  };

  state: {
    mode: 1 | 2;
    value: string;
    error: boolean;
    inverse: boolean;
  };

  handleMode1: Function;
  handleMode2: Function;

  constructor(props: Object) {
    super(props);
    let v = props.value || {};
    if (typeof v === 'string') {
      v = { value: v };
    }
    let value: Alaska$filter = v;
    this.state = {
      mode: value.exact === false || value.exact === 'false' ? 2 : 1, // 1 精确匹配 2 包含
      value: value.value || '',
      error: !value.value,
      inverse: value.inverse || false
    };
    this.handleMode1 = this.handleMode.bind(this, 1);
    this.handleMode2 = this.handleMode.bind(this, 2);
  }

  handleMode(mode: 1 | 2) {
    this.setState({ mode }, () => this.handleBlur());
  }

  handleChange = (event: ReactInputEvent) => {
    this.setState({ value: event.target.value });
  };

  handleInverse = () => {
    this.setState({ inverse: !this.state.inverse }, () => this.handleBlur());
  };

  handleBlur = () => {
    const { mode, value, inverse } = this.state;
    if (!value) {
      this.setState({ error: true });
      return;
    }
    this.setState({ error: false });
    let filter: Alaska$filter = { value };
    if (mode !== 2) {
      //不是包含：精确匹配
      filter.exact = true;
    }
    if (inverse) {
      filter.inverse = true;
    }
    this.props.onChange(filter);
  };

  render() {
    const t = this.context.t;
    let { className, field, onClose } = this.props;
    const { mode, value, error, inverse } = this.state;
    const buttonClassName = 'btn btn-default';
    const buttonClassNameActive = buttonClassName + ' btn-success';
    className += ' text-field-filter' + (error ? ' error' : '');
    return (
      <div className={className}>
        <label className="col-xs-2 control-label text-right">{field.label}</label>
        <div className="form-inline col-xs-10">
          <div className="form-group btn-group">
            <a
              className={mode === 1 ? buttonClassNameActive : buttonClassName}
              onClick={this.handleMode1}
            >{t('equal')}</a>
            <a
              className={mode === 2 ? buttonClassNameActive : buttonClassName}
              onClick={this.handleMode2}
            >{t('contain')}</a>
          </div>
          <input
            type="text"
            className="form-control"
            onChange={this.handleChange}
            onBlur={this.handleBlur}
            value={value}
          />
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
