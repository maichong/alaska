// @flow

import React from 'react';
import PropTypes from 'prop-types';
import shallowEqualWithout from 'shallow-equal-without';

export default class TextFieldView extends React.Component<Alaska$view$Field$View$Props> {
  static contextTypes = {
    t: PropTypes.func,
  };

  shouldComponentUpdate(nextProps: Alaska$view$Field$View$Props): boolean {
    return nextProps.record._id !== this.props.record._id ||
      !shallowEqualWithout(nextProps, this.props, 'record', 'onChange', 'model');
  }

  getError(): string {
    const { t } = this.context;
    const { field, value } = this.props;
    if (value && field.match && typeof field.match === 'string') {
      let matchs = field.match.match(/^\/(.+)\/([igm]*)$/);
      if (matchs) {
        let match = new RegExp(matchs[1], matchs[2]);
        if (!match.test(value)) {
          return t('Invalid format');
        }
      }
    }
    return '';
  }

  handleChange = (event: SyntheticInputEvent<*>) => {
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
      errorText,
      model
    } = this.props;
    const { t } = this.context;
    let { help } = field;
    className += ' text-field';
    errorText = errorText || this.getError();
    if (errorText) {
      className += ' has-error';
      help = errorText;
    }
    let helpElement = help ? <p className="help-block">{help}</p> : null;
    let inputElement;
    value = value || '';
    if (disabled && value && field.translate) {
      value = t(value, model.serviceId);
    }
    if (field.fixed) {
      inputElement = <p className="form-control-static">{value}</p>;
    } else {
      let placeholder = field.placeholder ? t(field.placeholder, field.service || model.serviceId) : '';
      if (field.multiLine) {
        inputElement = (<textarea
          className="form-control"
          placeholder={placeholder}
          onChange={this.handleChange}
          disabled={disabled}
          value={value}
        />);
      } else {
        inputElement = (<input
          type="text"
          className="form-control"
          placeholder={placeholder}
          onChange={this.handleChange}
          value={value}
          disabled={disabled}
        />);
        let addonAfter = field.addonAfter ?
          <span className="input-group-addon">{t(field.addonAfter, field.service || model.serviceId)}</span> : null;
        let addonBefore = field.addonBefore ?
          <span className="input-group-addon">{t(field.addonBefore, field.service || model.serviceId)}</span> : null;
        if (addonAfter || addonBefore) {
          inputElement = <div className="input-group">{addonBefore}{inputElement}{addonAfter}</div>;
        }
      }
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
        {label ? <label className="control-label">{label}</label> : null}
        {inputElement}
        {helpElement}
      </div>
    );
  }
}
