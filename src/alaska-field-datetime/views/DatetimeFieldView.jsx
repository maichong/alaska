// @flow

import React from 'react';
import PropTypes from 'prop-types';
import shallowEqualWithout from 'shallow-equal-without';
import DateTime from 'react-datetime';
import moment from 'moment';

export default class DatetimeFieldView extends React.Component<Alaska$view$Field$View$Props> {
  static contextTypes = {
    settings: PropTypes.object
  };

  componentWillMount() {
    moment.locale(this.context.settings.locale);
  }

  shouldComponentUpdate(props: Alaska$view$Field$View$Props) {
    return !shallowEqualWithout(props, this.props, 'record', 'onChange', 'model');
  }

  render() {
    let {
      className, value, field, disabled, errorText, onChange
    } = this.props;
    let valueString: string = '';
    if (field.format && value) {
      valueString = moment(value).format(field.format);
    }
    let { help } = field;
    className += ' date-field';
    if (errorText) {
      className += ' has-error';
      help = errorText;
    }
    let helpElement = help ? <p className="help-block">{help}</p> : null;
    let inputElement;
    if (field.fixed) {
      inputElement = <p className="form-control-static">{valueString}</p>;
    } else if (disabled) {
      inputElement = <input type="text" className="form-control" disabled value={valueString} />;
    } else {
      inputElement = <DateTime
        value={valueString || value}
        dateFormat={field.dateFormat}
        timeFormat={field.timeFormat}
        onChange={(v) => {
          v = v || '';
          // $Flow v is moment
          v = v.format ? v.format() : '';
          onChange(v);
        }}
      />;
    }

    let label = field.nolabel ? '' : field.label;

    if (field.horizontal === false) {
      let labelElement = label ? <label className="control-label">{label}</label> : null;
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
