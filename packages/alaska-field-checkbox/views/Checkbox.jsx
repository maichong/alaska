// @flow

import React from 'react';

export default class Checkbox extends React.Component {

  props: {
    style: Object,
    radio: boolean,
    value: boolean,
    disabled: boolean,
    label: string,
    onCheck: Function,
  };

  handleCheck = () => {
    if (this.props.onCheck) {
      this.props.onCheck(!this.props.value);
    }
  };

  render() {
    const { label, disabled, value, radio, style } = this.props;
    let checked = value ? 'checked' : false;
    let type = radio ? 'radio' : 'checkbox';
    return (
      <label className={type} style={style}>
        <input
          type={type}
          disabled={disabled}
          checked={checked}
          className={'custom-' + type}
          onChange={this.handleCheck}
        />
        <span className="icons">
          <span className="icon-unchecked" />
          <span className="icon-checked" />
        </span>
        {label}
      </label>
    );
  }
}
