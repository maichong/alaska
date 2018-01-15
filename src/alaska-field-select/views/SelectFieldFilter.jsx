// @flow

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Select from './Select';
import SelectCheckbox from './SelectCheckbox';
import Switch from './Switch';

type State = {
  value: Alaska$SelectField$value,
  inverse: boolean,
  error: boolean
};

export default class SelectFieldFilter extends React.Component<Alaska$view$Field$Filter$Props, State> {
  static contextTypes = {
    t: PropTypes.func,
  };

  constructor(props: Alaska$view$Field$Filter$Props) {
    super(props);
    let value: {
      value?: string,
      inverse?: boolean
      // $Flow
    } = props.value || {};
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      value = { value };
    }
    this.state = {
      value: value.value || '',
      inverse: value.inverse === true || value.inverse === 'true',
      error: value.value === undefined
    };
  }

  t(opt: Alaska$SelectField$option): Alaska$SelectField$option {
    const { t } = this.context;
    if (this.props.field.translate === false || !t) {
      return opt;
    }
    // $Flow
    return Object.assign({}, opt, {
      label: t(opt.label)
    });
  }

  handleInverse = () => {
    this.setState({ inverse: !this.state.inverse }, () => this.handleBlur());
  };

  handleChange = (value: Alaska$SelectField$value) => {
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
    const { t } = this.context;
    let { className, field, onClose } = this.props;
    const { value, inverse, error } = this.state;
    const buttonClassName = 'btn btn-default';
    const buttonClassNameActive = buttonClassName + ' btn-success';
    className += ' select-field-filter' + (error ? ' error' : '');
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
          >{t('inverse')}
          </a>
        </div>
        <a className="btn field-filter-close" onClick={onClose}><i className="fa fa-close" /></a>
      </div>
    );
  }
}
