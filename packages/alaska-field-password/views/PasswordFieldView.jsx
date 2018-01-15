// @flow

import React from 'react';
import PropTypes from 'prop-types';
import shallowEqualWithout from 'shallow-equal-without';

type State = {
  value1: string,
  value2: string,
  errorText: string
};

export default class PasswordFieldView extends React.Component<Alaska$view$Field$View$Props, State> {
  static contextTypes = {
    t: PropTypes.func
  };

  handleChange1: Function;
  handleChange2: Function;

  constructor(props: Alaska$view$Field$View$Props) {
    super(props);
    this.state = {
      value1: '',
      value2: '',
      errorText: ''
    };
    this.handleChange1 = this.handleChange.bind(this, 1);
    this.handleChange2 = this.handleChange.bind(this, 2);
  }

  shouldComponentUpdate(props: Alaska$view$Field$View$Props, state: State) {
    return props.disabled !== this.props.disabled || !shallowEqualWithout(state, this.state);
  }

  handleChange(index: number, e: SyntheticInputEvent<*>) {
    // $Flow e.target.value确认存在
    this.setState({ ['value' + index]: e.target.value });
  }

  handleBlur = () => {
    const { t } = this.context;
    let { value1, value2 } = this.state;
    let newState = {
      errorText: ''
    };
    if (value1 && value1 !== value2) {
      newState.errorText = t(value2 ? 'The passwords are not match' : 'Please enter the new password again');
    }
    if (value1 && value1 === value2) {
      if (this.props.onChange) {
        this.props.onChange(value1);
      }
    }

    this.setState(newState);
  };

  render() {
    const { t } = this.context;
    let { className, field, disabled } = this.props;
    const { state, props } = this;
    className += ' password-field';

    let { help } = field;
    let errorText = state.errorText || props.errorText;
    if (errorText) {
      help = errorText;
      className += ' has-error';
    }

    let helpElement = help ? <p className="help-block">{help}</p> : null;

    let inputElement;

    if (field.fixed) {
      inputElement = <p className="form-control-static">******</p>;
    } else {
      inputElement = (
        <div className="row">
          <div className="col-sm-4">
            <input
              className="form-control"
              type="password"
              value={state.value1}
              placeholder={t('Enter new password')}
              disabled={disabled}
              onBlur={this.handleBlur}
              onChange={this.handleChange1}
            />
          </div>
          <div className="col-sm-4">
            <input
              className="form-control"
              type="password"
              value={state.value2}
              placeholder={t('Repeat password')}
              disabled={disabled}
              onBlur={this.handleBlur}
              onChange={this.handleChange2}
            />
          </div>
        </div>
      );
    }

    let label = field.nolabel ? '' : field.label;

    if (field.horizontal) {
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
    return (
      <div className={className}>
        {label ? (<label className="control-label">{label}</label>) : null}
        {inputElement}
        {helpElement}
      </div>
    );
  }
}
