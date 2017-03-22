// @flow

import React from 'react';
import numeral from 'numeral';
import _ from 'lodash';
import shallowEqualWithout from 'shallow-equal-without';

export default class BytesFieldView extends React.Component {

  props: {
    value: any,
    model: Object,
    data: Object,
    field: Object,
    disabled: boolean,
    errorText: string,
    onChange: Function,
  };

  state: {
    display: string,
    value: string
  };
  focused: boolean;

  constructor(props: Object) {
    super(props);
    this.state = {
      display: numeral(props.value).format('0,0'),
      value: ''
    };
  }

  componentWillReceiveProps(nextProps: Object) {
    let newState = {};
    if (nextProps.value) {
      newState.value = numeral(nextProps.value).format('0,0');
      if (this.focused) {
        //正在输入
        newState.display = nextProps.value;
      } else {
        //不在输入状态
        newState.display = newState.value;
      }
    }
    this.setState(newState);
  }

  shouldComponentUpdate(props: Object, state: Object) {
    return !shallowEqualWithout(props, this.props, 'data', 'onChange', 'model')
      || !shallowEqualWithout(state, this.state);
  }

  handleChange = (event: Event) => {
    // $Flow 确认event.target.value属性值存在
    let display = event.target.value;
    this.setState({ display });
  };

  handleFocus = () => {
    this.focused = true;
  };

  handleBlur = () => {
    this.focused = false;
    let value = this.state.display;
    let unfomarted = numeral(value);
    if (isNaN(unfomarted)) {
      unfomarted = 0;
    }
    this.setState({ display: numeral(unfomarted).format('0,0') });
    if (unfomarted !== this.props.value) {
      if (this.props.onChange) {
        this.props.onChange(unfomarted);
      }
    }
  };

  render() {
    const {
      field,
      disabled,
      errorText,
    } = this.props;
    let { help, unit, size, precision } = field;
    let className = 'form-group bytes-field';
    if (errorText) {
      className += ' has-error';
      help = errorText;
    }
    // $Flow
    let num: number = numeral(this.state.display) || 0;
    let units = ['', 'K', 'M', 'G', 'T', 'P', 'E'];
    while (num > size && units.length > 1) {
      num /= size;
      units.shift();
    }
    let display = _.round(num, precision) + units[0] + unit;
    let helpElement = help ? <p className="help-block">{help}</p> : null;
    let inputElement;
    if (field.fixed) {
      inputElement = <p className="form-control-static">{display}</p>;
    } else {
      inputElement = (<div className="input-group"><input
        type="text"
        className="form-control"
        onChange={this.handleChange}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        value={this.state.display}
        disabled={disabled}
      />
        <span className="input-group-addon">{display}</span>
      </div>);
    }

    let label = field.nolabel ? '' : field.label;

    if (field.horizontal === false) {
      let labelElement = label ? (<label className="control-label">{label}</label>) : null;
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
