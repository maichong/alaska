import * as React from 'react';
import * as shallowEqualWithout from 'shallow-equal-without';
import { FieldViewProps } from 'alaska-admin-view';
import * as tr from 'grackle';

export default class GeoFieldView extends React.Component<FieldViewProps> {

  shouldComponentUpdate(props: FieldViewProps) {
    return !shallowEqualWithout(props, this.props, 'record', 'onChange', 'model', 'field');
  }

  render() {
    let {
      className,
      field,
      value,
      errorText
    } = this.props;
    let { help } = field;
    className += ' geo-field';
    if (errorText) {
      className += ' is-invalid';
      help = errorText;
    }
    let helpElement = help ? <small className={errorText ? 'invalid-feedback' : 'text-muted'}>{help}</small> : null;
    let inputElement;

    if (value && value[0]) {
      value = <a
        href={
          `http://m.amap.com/navi/?dest=${value[0]},${value[1]
          }&destName=%E4%BD%8D%E7%BD%AE&key=e67780f754ee572d50e97c58d5a633cd`
        }
        target="_blank"
        rel="noopener noreferrer"
      >{tr('LNG')}:{value[0]} {tr('LAT')}:{value[1]}
      </a>;
    } else {
      value = null;
    }
    inputElement = <p className="form-control-plaintext">{value}</p>;
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
