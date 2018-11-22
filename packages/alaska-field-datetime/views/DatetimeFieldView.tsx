import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as shallowEqualWithout from 'shallow-equal-without';
import * as DateTime from 'react-datetime';
import * as moment from 'moment';
import { FieldViewProps } from 'alaska-admin-view';

export default class DatetimeFieldView extends React.Component<FieldViewProps> {
  static defaultProps = {
    locale: 'zh-CN'
  };
  componentWillMount() {
    // moment.locale(this.props.locale);
  }

  shouldComponentUpdate(props: FieldViewProps) {
    return !shallowEqualWithout(props, this.props, 'record', 'onChange', 'model');
  }

  render() {
    let {
      className, value, field, disabled, errorText, onChange
    } = this.props;
    let format = field.format ? field.format : 'YYYY-MM-DD HH:mm:ss';
    let dateFormat = field.dateFormat ? field.dateFormat : 'YYYY-MM-DD';
    let timeFormat = field.timeFormat ? field.timeFormat : 'HH:mm:ss';
    let valueString: string = '';
    if (value) {
      valueString = moment(value).format(format);
    }
    let { help } = field;
    className += ' date-field';
    if (errorText) {
      className += ' has-error';
      help = errorText;
    }
    let helpElement = help ? <small className={errorText ? 'invalid-feedback' : 'text-muted'}>{help}</small> : null;
    let inputElement;
    if (field.fixed) {
      inputElement = <p className="form-control-plaintext">{valueString}</p>;
    } else if (disabled) {
      inputElement = <input type="text" className="form-control" disabled value={valueString} />;
    } else {
      inputElement = <DateTime
        locale={this.props.locale.toLowerCase()}
        value={valueString || value}
        dateFormat={dateFormat}
        timeFormat={timeFormat}
        onChange={(v) => {
          v = v || '';
          v = (v as moment.Moment).format ? (v as moment.Moment).format() : '';
          onChange(v);
        }}
      />;
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

    let labelElement = label ? <label className="col-form-label">{label}</label> : null;
    return (
      <div className={className}>
        {labelElement}
        {inputElement}
        {helpElement}
      </div>
    );
  }
}
