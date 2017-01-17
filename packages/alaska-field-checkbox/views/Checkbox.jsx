// @flow

import React from 'react';

const { bool, object, func, string } = React.PropTypes;

export default class Checkbox extends React.Component {

  static propTypes = {
    style: object,
    radio: bool,
    value: bool,
    label: string,
    onCheck: func,
  };

  handleCheck = () => {
    if (this.props.onCheck) {
      this.props.onCheck(!this.props.value);
    }
  };

  render() {
    let props = this.props;
    let checked = props.value ? 'checked' : false;
    let type = props.radio ? 'radio' : 'checkbox';
    return (
      <label className={type} style={props.style}>
        <input
          type={type}
          disabled={props.disabled}
          checked={checked}
          className={'custom-' + type}
          onChange={this.handleCheck}
        />
        <span className="icons">
          <span className="icon-unchecked" />
          <span className="icon-checked" />
        </span>
        {props.label}
      </label>
    );
  }
}
