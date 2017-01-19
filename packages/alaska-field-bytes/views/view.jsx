// @flow

import React from 'react';
import numeral from 'numeral';
import _ from 'lodash';
import { shallowEqual } from 'alaska-admin-view';

const { bool, object, any, func, string } = React.PropTypes;

export default class BytesFieldView extends React.Component {

  static propTypes = {
    value: any,
    model: object,
    data: object,
    field: object,
    disabled: bool,
    errorText: string,
    onChange: func,
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
    return !shallowEqual(props, this.props, 'data', 'onChange', 'model') || !shallowEqual(state, this.state);
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
    // $Flow 和node_modules/flow-numeral/flow/index.js:3冲突 numeral()应该有参数,但现在不知道应该传什么
    let unfomarted = numeral().unformat(value);
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
    // $Flow 和node_modules/flow-numeral/flow/index.js:3冲突 numeral()应该有参数,但现在不知道应该传什么
    let display = numeral().unformat(this.state.display) || 0;
    let units = ['', 'K', 'M', 'G', 'T', 'P', 'E'];
    while (display > size && units.length > 1) {
      display /= size;
      units.shift();
    }
    display = _.round(display, precision) + units[0] + unit;
    let helpElement = help ? <p className="help-block">{help}</p> : null;
    let inputElement;
    if (field.static) {
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
