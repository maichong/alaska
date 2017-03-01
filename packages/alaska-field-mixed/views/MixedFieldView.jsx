// @flow

/* eslint no-eval:0 */

import React from 'react';
import shallowEqualWithout from 'shallow-equal-without';

export default class MixedFieldView extends React.Component {

  props: {
    model: Object,
    field: Object,
    data: Object,
    errorText: string,
    disabled: boolean,
    value: any,
    onChange: Function,
  };

  state: {
    text:string,
    style:?string
  };

  constructor(props: Object) {
    super(props);
    this.state = {
      text: JSON.stringify(props.value, null, 4),
      style: undefined
    };
  }

  componentWillReceiveProps(props: Object) {
    if (props.value !== undefined) {
      this.setState({
        text: JSON.stringify(props.value, null, 4)
      });
    }
  }

  shouldComponentUpdate(props: Object, state: Object) {
    return !shallowEqualWithout(props, this.props, 'data', 'onChange', 'model')
      || !shallowEqualWithout(state, this.state);
  }

  handleChange = (e: Event) => {
    // $Flow 已确认e.target.value属性存在
    let value = e.target.value;
    let state = {
      text: value,
      style: undefined
    };
    try {
      JSON.parse(value);
      state.style = undefined;
    } catch (error) {
      try {
        eval('json=' + value);
        state.style = undefined;
      } catch (err) {
        state.style = 'has-error';
      }
    }
    this.setState(state);
  };

  handleBlur = (e: Event) => {
    // $Flow 已确认e.target.value属性存在
    let value = e.target.value;
    let json;
    let state: Object = {
      text: value,
      style: undefined
    };
    try {
      json = JSON.parse(value);
      state.style = undefined;
    } catch (error) {
      try {
        json = eval('json=' + value);
        state.style = undefined;
      } catch (err) {
        state.style = 'has-error';
      }
    }
    this.setState(state);
    if (json !== undefined && this.props.onChange) {
      this.props.onChange(json);
    }
  };

  render() {
    let { field, disabled } = this.props;

    let inputElement;
    if (disabled || field.fixed) {
      inputElement = <pre>{this.state.text}</pre>;
    } else {
      inputElement = <textarea
        className="form-control"
        onChange={this.handleChange}
        onBlur={this.handleBlur}
        value={this.state.text}
      />;
    }

    let className = 'form-group mixed-field ' + (this.state.style || '');

    let helpElement = field.help ? <p className="help-block">{field.help}</p> : null;

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
