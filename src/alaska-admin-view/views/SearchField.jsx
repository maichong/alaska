// @flow

import React from 'react';
import Node from './Node';

type Props = {
  value?: string,
  onChange: Function;
  placeholder?: string
};

type State = {
  value: string
};

export default class SearchField extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { value: props.value || '' };
  }

  componentWillReceiveProps(props: Props) {
    if (props.value !== this.state.value) {
      this.setState({ value: props.value });
    }
  }

  handleChange = (event: SyntheticInputEvent<*>) => {
    let value = event.target.value;
    this.setState({ value });
  };

  handleBlur = () => {
    let value = this.state.value.trim();
    this.props.onChange(value);
  };

  handleKeyPress = (event: SyntheticKeyboardEvent<*>) => {
    if (event.key === 'Enter') {
      this.handleBlur();
    }
  };

  handleClear = () => {
    this.setState({ value: '' });
    if (this.props.value) {
      this.props.onChange('');
    }
  };

  render() {
    return (
      <Node id="searchField" className="search-field">
        <input
          className="form-control"
          type="search"
          value={this.state.value}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          onKeyPress={this.handleKeyPress}
          placeholder={this.props.placeholder}
        />
        {this.state.value ?
          <div className="search-clear" onClick={this.handleClear}>
            <i className="fa fa-close" />
          </div> : null
        }
      </Node>
    );
  }
}
