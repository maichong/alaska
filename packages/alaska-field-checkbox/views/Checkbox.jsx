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
    const { radio, value, disabled, label, style } = this.props;

    let className = 'checkbox';
    if (disabled) {
      className += ' disabled';
    }
    if (value) {
      className += ' checked';
    }

    let icon = 'square-o';
    if (radio) {
      if (value) {
        icon = 'check-circle';
      } else {
        icon = 'circle-o';
      }
    } else {
      if (value) {
        icon = 'check-square';
      } else {
        //icon = 'square-o';
      }
    }

    return (
      <label className={className} onClick={disabled ? null : this.handleCheck} style={style}>
        <i className={'fa fa-' + icon} />
        {label}
      </label>
    );
  }
}
