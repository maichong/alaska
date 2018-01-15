// @flow

/* eslint no-eval:0 */

import React from 'react';
import shallowEqualWithout from 'shallow-equal-without';

type State = {
  text: string,
  style: ?string
};

export default class MixedFieldView extends React.Component<Alaska$view$Field$View$Props, State> {
  constructor(props: Alaska$view$Field$View$Props) {
    super(props);
    this.state = {
      text: JSON.stringify(props.value, null, 4),
      style: undefined
    };
  }

  componentWillReceiveProps(props: Alaska$view$Field$View$Props) {
    if (props.value !== undefined) {
      this.setState({
        text: JSON.stringify(props.value, null, 4)
      });
    }
  }

  shouldComponentUpdate(props: Alaska$view$Field$View$Props, state: State) {
    return !shallowEqualWithout(props, this.props, 'record', 'onChange', 'model')
      || !shallowEqualWithout(state, this.state);
  }

  handleChange = (e: SyntheticInputEvent<*>) => {
    let { value } = e.target;
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

  handleBlur = (e: SyntheticInputEvent<*>) => {
    let { value } = e.target;
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
    let {
      className, field, disabled, errorText
    } = this.props;

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

    let { help } = field;

    className += ' mixed-field ' + (this.state.style || '');
    if (errorText) {
      className += ' has-error';
      help = errorText;
    }

    let helpElement = help ? <p className="help-block">{help}</p> : null;

    let label = field.nolabel ? '' : field.label;

    if (field.horizontal) {
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
    return (
      <div className={className}>
        {label ? (<label className="control-label">{label}</label>) : null}
        {inputElement}
        {helpElement}
      </div>
    );
  }
}
