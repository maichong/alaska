// @flow

import React from 'react';
import shallowEqualWithout from 'shallow-equal-without';
import Checkbox from './Checkbox';

export default class CheckboxFieldView extends React.Component<Alaska$view$Field$View$Props> {
  shouldComponentUpdate(props: Alaska$view$Field$View$Props) {
    return !shallowEqualWithout(props, this.props, 'record', 'onChange', 'model');
  }

  handleChange = (checked: boolean) => {
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
    let { help } = field;
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
      onChange={this.handleChange}
      disabled={disabled}
    />);

    if (field.horizontal) {
      return (
        <div className={className}>
          <div className="col-sm-offset-2 col-sm-10">
            {input}
            {helpElement}
          </div>
        </div>
      );
    }

    return (
      <div className={className}>
        {input}
        {helpElement}
      </div>
    );
  }
}
