// @flow

import React from 'react';
import PropTypes from 'prop-types';

export default class CheckboxFieldFilter extends React.Component {

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
    value:boolean;
  };

  constructor(props: Object) {
    super(props);
    this.state = {
      value: props.value !== false && props.value !== 'false'
    };
  }

  componentDidMount() {
    this.props.onChange(this.state.value);
  }

  handleClick1 = () => {
    this.setState({ value: false });
    this.props.onChange(false);
  };

  handleClick2 = () => {
    this.setState({ value: true });
    this.props.onChange(true);
  };

  render() {
    const t = this.context.t;
    let { className, field, onClose } = this.props;
    const { value } = this.state;
    const buttonClassName = 'btn btn-default';
    const buttonClassNameActive = 'btn btn-success';
    return (
      <div className={className + 'checkbox-field-filter'}>
        <label className="col-xs-2 control-label text-right">{field.label}</label>
        <div className="col-xs-10">
          <div className="btn-group">
            <a
              className={!value ? buttonClassNameActive : buttonClassName}
              onClick={this.handleClick1}
            >{t('no')}</a>
            <a
              className={value ? buttonClassNameActive : buttonClassName}
              onClick={this.handleClick2}
            >{t('yes')}</a>
          </div>
        </div>
        <a className="btn field-filter-close" onClick={onClose}><i className="fa fa-close" /></a>
      </div>
    );
  }
}
