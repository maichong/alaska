// @flow

import React from 'react';
import numeral from 'numeral';
import _ from 'lodash';
import shallowEqualWithout from 'shallow-equal-without';

type State = {
  display: string
};

export default class BytesFieldView extends React.Component<Alaska$view$Field$View$Props, State> {
  focused: boolean;

  constructor(props: Alaska$view$Field$View$Props) {
    super(props);
    this.state = {
      display: numeral(props.value).format('0,0')
    };
  }

  componentWillReceiveProps(nextProps: Alaska$view$Field$View$Props) {
    let newState = {};
    if (nextProps.value) {
      if (this.focused) {
        //正在输入
        newState.display = nextProps.value;
      } else {
        //不在输入状态
        newState.display = numeral(nextProps.value).format('0,0');
      }
    }
    this.setState(newState);
  }

  shouldComponentUpdate(props: Alaska$view$Field$View$Props, state: State) {
    return !shallowEqualWithout(props, this.props, 'record', 'onChange', 'model')
      || !shallowEqualWithout(state, this.state);
  }

  handleChange = (event: SyntheticInputEvent<*>) => {
    let display = event.target.value;
    this.setState({ display });
  };

  handleFocus = () => {
    this.focused = true;
    this.forceUpdate();
  };

  handleBlur = () => {
    this.focused = false;
    let value = this.state.display;
    let unfomarted = numeral(value).value();
    if (_.isNaN(unfomarted)) {
      unfomarted = 0;
    }
    this.setState({ display: numeral(unfomarted).format('0,0') }, () => this.forceUpdate());
    if (unfomarted !== this.props.value) {
      if (this.props.onChange) {
        this.props.onChange(unfomarted);
      }
    }
  };

  render() {
    let {
      className,
      field,
      disabled,
      errorText,
    } = this.props;
    let {
      help, unit, size, precision
    } = field;
    className += ' bytes-field';
    if (errorText) {
      className += ' has-error';
      help = errorText;
    }
    let value: number = numeral(this.state.display).value() || 0;
    let units = ['', 'K', 'M', 'G', 'T', 'P', 'E'];
    let num = value;
    while (num > (size || 0) && units.length > 1) {
      num /= (size || 0);
      units.shift();
    }
    let u = this.focused ? unit : (units[0] + (unit || ''));
    let display = this.focused ? value : _.round(num, precision);
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
        value={display}
        disabled={disabled}
      />
        <span className="input-group-addon">{u}</span>
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
