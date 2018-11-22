import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as shallowEqualWithout from 'shallow-equal-without';
import * as DateTime from 'react-datetime';
import * as moment from 'moment';
import { FieldViewProps } from 'alaska-admin-view';

export default class DateFieldView extends React.Component<FieldViewProps> {
  static contextTypes = {
    settings: PropTypes.object
  };

  context: any;
  componentWillMount() {
    moment.locale(this.context.settings.locale);
  }

  shouldComponentUpdate(props: FieldViewProps) {
    return !shallowEqualWithout(props, this.props, 'record', 'onChange', 'model');
  }

  render() {
    let {
      className, value, field, disabled, errorText, onChange
    } = this.props;
    let { help } = field;
    className += ' date-field';
    if (errorText) {
      className += ' has-error';
      help = errorText;
    }
    if (field.format && value) {
      value = moment(value).format(field.format);
    }
    let helpElement = help ? <small className={errorText ? 'invalid-feedback' : 'text-muted'}>{help}</small> : null;
    let inputElement;
    if (field.fixed) {
      inputElement = <p className="form-control-plaintext">{value}</p>;
    } else if (disabled) {
      inputElement = <input type="text" className="form-control" disabled value={value} />;
    } else {
      inputElement = <DateTime
        value={value}
        dateFormat={field.format}
        timeFormat={false}
        onChange={onChange}
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

    return (
      <div className={className}>
        {label ? <label className="col-form-label">{label}</label> : null}
        {inputElement}
        {helpElement}
      </div>
    );
  }
}
