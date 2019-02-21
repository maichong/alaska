import * as React from 'react';
import * as shallowEqualWithout from 'shallow-equal-without';
import * as tr from 'grackle';
import { FieldViewProps } from 'alaska-admin-view';

export default class TextFieldView extends React.Component<FieldViewProps> {

  shouldComponentUpdate(nextProps: FieldViewProps): boolean {
    if (!nextProps.record || !this.props.record) return true;
    return nextProps.record._id !== this.props.record._id ||
      !shallowEqualWithout(nextProps, this.props, 'record', 'onChange', 'model');
  }

  getError(): string {
    const { field, value } = this.props;
    if (value && field.match && typeof field.match === 'string') {
      let matchs = field.match.match(/^\/(.+)\/([igm]*)$/);
      if (matchs) {
        let match = new RegExp(matchs[1], matchs[2]);
        if (!match.test(value)) {
          return tr('Invalid format');
        }
      }
    }
    return '';
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      error,
      model
    } = this.props;
    let { help } = field;
    className += ' text-field';
    error = error || this.getError();

    if (error) {
      className += ' is-invalid';
      help = error as string;
    }
    let helpElement = help ? <small className={error ? 'form-text invalid-feedback' : 'form-text text-muted'}>{help}</small> : null;
    let inputElement;
    value = value || '';
    if (disabled && value && field.translate) {
      value = tr(value, model.serviceId);
    }
    if (field.fixed) {
      inputElement = <p className="form-control-plaintext">{value}</p>;
    } else {
      let placeholder = field.placeholder ? tr(field.placeholder, field.service || model.serviceId) : '';
      if (field.multiLine) {
        inputElement = (<textarea
          className={!error ? 'form-control' : 'form-control is-invalid'}
          placeholder={placeholder}
          onChange={this.handleChange}
          disabled={disabled}
          value={value}
        />);
      } else {
        inputElement = (<input
          type="text"
          className={!error ? 'form-control' : 'form-control is-invalid'}
          placeholder={placeholder}
          onChange={this.handleChange}
          value={value}
          disabled={disabled}
        />);
        let addonAfter = field.addonAfter ?
          <div className="input-group-append">
            <span className="input-group-text">{tr(field.addonAfter, field.service || model.serviceId)}</span>
          </div> : null;
        let addonBefore = field.addonBefore ?
          <div className="input-group-prepend">
            <span className="input-group-text">{tr(field.addonBefore, field.service || model.serviceId)}</span>
          </div> : null;
        if (addonAfter || addonBefore) {
          inputElement = <div className="input-group">{addonBefore}{inputElement}{addonAfter}</div>;
        }
      }
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
