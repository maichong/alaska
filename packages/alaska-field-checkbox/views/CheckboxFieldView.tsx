import * as React from 'react';
import { FieldViewProps } from 'alaska-admin-view';
import * as shallowEqualWithout from 'shallow-equal-without';
import Checkbox from '@samoyed/checkbox';

export default class CheckboxFieldView extends React.Component<FieldViewProps> {
  shouldComponentUpdate(props: FieldViewProps) {
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
      disabled,
      className
    } = this.props;
    let { help } = field;
    className += ' checkbox-field';
    if (errorText) {
      className += ' is-invalid';
      help = errorText;
    }
    let helpElement = help ? <small className={errorText ? 'invalid-feedback' : 'text-muted'}>{help}</small> : null;
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
          <div className="offset-sm-2 col-sm-10">
            <div>{input}</div>
            {helpElement}
          </div>
        </div>
      );
    }

    return (
      <div className={className}>
        <div>{input}</div>
        {helpElement}
      </div>
    );
  }
}
