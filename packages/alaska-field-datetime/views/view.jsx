// @flow

import React from 'react';
import { shallowEqual } from 'alaska-admin-view';
import DateTime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import moment from 'moment';
import 'moment/locale/zh-cn';

const { bool, object, any, func, string } = React.PropTypes;

export default class DatetimeFieldView extends React.Component {

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
    settings: object
  };

  constructor(props) {
    super(props);
    this.state = {
      value: props.value ? new Date(props.value) : new Date
    };
  }

  componentWillMount() {
    moment.locale(this.context.settings.locale);
  }

  shouldComponentUpdate(props, state) {
    return !shallowEqual(props, this.props, 'data', 'onChange', 'model') || !shallowEqual(state, this.state);
  }

  render() {
    let props = this.props;
    let value = props.value;
    let field = props.field;
    let disabled = props.disabled;
    if (field.format && value) {
      value = moment(value).format(field.format);
    }
    let errorText = props.errorText;
    let help = field.help;
    let className = 'form-group datetime-field';
    if (errorText) {
      className += ' has-error';
      help = errorText;
    }
    let helpElement = help ? <p className="help-block">{help}</p> : null;
    let inputElement;
    if (field.static) {
      inputElement = <p className="form-control-static">{value}</p>;
    } else if (disabled) {
      inputElement = <input type="text" className="form-control" disabled value={value}/>;
    } else {
      inputElement = <DateTime
        value={value}
        dateFormat={field.dateFormat}
        timeFormat={field.timeFormat}
        onChange={props.onChange}
      />;
    }

    let label = field.nolabel ? '' : field.label;

    if (field.horizontal === false) {
      let labelElement = label ? (
        <label className="control-label">{label}</label>
      ) : null;
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
