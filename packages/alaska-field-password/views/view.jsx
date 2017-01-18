// @flow

import React from 'react';
import { shallowEqual } from 'alaska-admin-view';

const { bool, object, any, func, string } = React.PropTypes;

export default class PasswordFieldView extends React.Component {

  static propTypes = {
    model: object,
    field: object,
    data: object,
    errorText: string,
    disabled: bool,
    value: any,
    onChange: func,
  };

  static contextTypes = {
    t: func
  };
  state: {
    value1:string,
    value2:string,
    errorText:string
  };
  handleChange1: Function;
  handleChange2: Function;

  constructor(props: Object) {
    super(props);
    this.state = {
      value1: '',
      value2: '',
      errorText: ''
    };
    this.handleChange1 = this.handleChange.bind(this, 1);
    this.handleChange2 = this.handleChange.bind(this, 2);
  }

  shouldComponentUpdate(props: Object, state: Object) {
    return props.disabled !== this.props.disabled || !shallowEqual(state, this.state);
  }

  handleChange(index: number, e: Event) {
    // $Flow e.target.value确认存在
    this.setState({ ['value' + index]: e.target.value });
  }

  handleBlur = () => {
    const t = this.context.t;
    let value1 = this.state.value1;
    let value2 = this.state.value2;
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
    const t = this.context.t;
    let { field, disabled } = this.props;
    let state = this.state;
    let className = 'form-group password-field';

    let help = field.help;
    let errorText = this.state.errorText || this.props.errorText;
    if (errorText) {
      help = errorText;
      className += ' has-error';
    }

    let helpElement = help ? <p className="help-block">{help}</p> : null;

    let inputElement;

    if (field.static) {
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

    if (field.horizontal === false) {
      let labelElement = label ? (<label className="control-label">{label}</label>) : null;
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
