// @flow

import React from 'react';
import shallowEqualWithout from 'shallow-equal-without';

const { object, string, func, any, bool } = React.PropTypes;

export default class IconFieldView extends React.Component {

  static propTypes = {
    model: object,
    field: object,
    data: object,
    errorText: string,
    disabled: bool,
    value: any,
    onChange: func,
  };

  shouldComponentUpdate(props: Object) {
    return !shallowEqualWithout(props, this.props, 'data', 'onChange', 'model', 'field');
  }

  handleChange = (event: Event) => {
    if (this.props.onChange) {
      // $Flow Event.target.value属性确认是存在的
      this.props.onChange(event.target.value);
    }
  };

  render() {
    let {
      field,
      disabled,
      value,
      errorText
    } = this.props;
    let help = field.help;
    let className = 'form-group icon-field';
    if (errorText) {
      className += ' has-error';
      help = errorText;
    }
    let helpElement = help ? <p className="help-block">{help}</p> : null;
    let inputElement;
    let icon = null;
    if (value) {
      icon = <i className={'fa fa-' + value} />;
    }
    if (field.static) {
      inputElement = <p className="form-control-static">{icon}</p>;
    } else {
      inputElement = <div className="input-group">
        <input type="text" className="form-control" onChange={this.handleChange} value={value} disabled={disabled} />
        <span className="input-group-addon">{icon}</span></div>;
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
