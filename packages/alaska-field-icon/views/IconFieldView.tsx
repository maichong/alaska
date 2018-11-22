import * as React from 'react';
import * as shallowEqualWithout from 'shallow-equal-without';
import { FieldViewProps } from 'alaska-admin-view';

export default class IconFieldView extends React.Component<FieldViewProps> {
  shouldComponentUpdate(props: FieldViewProps) {
    return !shallowEqualWithout(props, this.props, 'record', 'onChange', 'model', 'field');
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (this.props.onChange) {
      this.props.onChange(event.target.value);
    }
  };

  render() {
    let {
      className,
      field,
      disabled,
      value,
      errorText
    } = this.props;
    let { help } = field;
    className += ' icon-field';
    if (errorText) {
      className += ' has-error';
      help = errorText;
    }
    let helpElement = help ? <small className={errorText ? 'invalid-feedback' : 'text-muted'}>{help}</small> : null;
    let inputElement;
    let icon = null;
    if (value) {
      icon = <i className={'fa fa-' + value} />;
    }
    if (field.fixed) {
      inputElement = <p className="form-control-plaintext">{icon}</p>;
    } else {
      inputElement = <div className="input-group">
        <input
          type="text"
          className={!errorText ? 'form-control' : 'form-control is-invalid'}
          onChange={this.handleChange}
          value={value || ''}
          disabled={disabled}
        />
        <div className="input-group-append">
          <span className="input-group-text">{icon}</span>
        </div>
      </div>;
    }

    let label = field.nolabel ? '' : field.label;

    if (field.horizontal) {
      return (
        <div className={className}>
          <label className="col-sm-2 col-form-label">{label}</label>
          <div className="col-sm-10">
            {inputElement}
            {helpElement}
          </div>
        </div>
      );
    }
    return (
      <div className={className}>
        {label ? <label className="col-form-label">{label}</label> : null}
        {inputElement}
        {helpElement}
      </div>
    );
  }
}
