// @flow

import React from 'react';
import shallowEqualWithout from 'shallow-equal-without';
import Checkbox from './Checkbox';

const { bool, object, func, string } = React.PropTypes;

export default class CheckboxFieldView extends React.Component {

  static propTypes = {
    model: object,
    field: object,
    data: object,
    errorText: string,
    disabled: bool,
    value: bool,
    onChange: func,
  };

  shouldComponentUpdate(props: Object) {
    return !shallowEqualWithout(props, this.props, 'data', 'onChange', 'model');
  }

  handleCheck = (checked: boolean) => {
    if (this.props.onChange) {
      this.props.onChange(checked);
    }
  };

  render() {
    let {
      field,
      value,
      errorText,
      disabled
    } = this.props;
    let help = field.help;
    let className = 'form-group checkbox-field';
    if (errorText) {
      className += ' has-error';
      help = errorText;
    }
    let helpElement = help ? <p className="help-block">{help}</p> : null;
    if (field.fixed) {
      disabled = true;
    }

    let input = (<Checkbox
      label={field.label}
      value={value}
      onCheck={this.handleCheck}
      disabled={disabled}
    />);

    if (field.horizontal === false) {
      return (
        <div className={className}>
          {input}
          {helpElement}
        </div>
      );
    }

    return (
      <div className={className}>
        <div className="col-sm-offset-2 col-sm-10">
          {input}
          {helpElement}
        </div>
      </div>
    );
  }
}
