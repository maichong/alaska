// @flow

import React from 'react';
import PropTypes from 'prop-types';
import shallowEqualWithout from 'shallow-equal-without';
import DateTime from 'react-datetime';
import moment from 'moment';
// $Flow
import 'moment/locale/zh-cn';

export default class DatetimeFieldView extends React.Component {

  static contextTypes = {
    settings: PropTypes.object
  };

  props: {
    className: string,
    model: Object,
    field: Object,
    data: Object,
    errorText: string,
    disabled: boolean,
    value: string,
    onChange: Function,
  };

  state: {
    value: Object;
  };

  constructor(props: Object) {
    super(props);
    this.state = {
      value: moment(props.value)
    };
  }

  componentWillMount() {
    moment.locale(this.context.settings.locale);
  }

  shouldComponentUpdate(props: Object, state: Object) {
    return !shallowEqualWithout(props, this.props, 'data', 'onChange', 'model')
      || !shallowEqualWithout(state, this.state);
  }

  render() {
    let { className, value, field, disabled, errorText, onChange } = this.props;
    let valueString: string = '';
    if (field.format && value) {
      valueString = moment(value).format(field.format);
    }
    let help = field.help;
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
        value={valueString||value}
        dateFormat={field.dateFormat}
        timeFormat={field.timeFormat}
        onChange={(value)=>{onChange(value.format())}}
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
