// @flow

import React from 'react';

type Props = {
  value: string,
  onChange: Function;
  placeholder?: string
};

type State = {
  value: string
};

export default class SearchField extends React.Component<Props, State> {
  _timer: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      value: ''
    };
  }

  componentWillReceiveProps(props: Props) {
    if (props.value !== this.state.value) {
      this.setState({
        value: props.value
      });
    }
  }

  handleChange = (event: SyntheticInputEvent<*>) => {
    let value = event.target.value;
    this.setState({ value });
    if (this._timer) {
      clearTimeout(this._timer);
    }
    this._timer = setTimeout(() => {
      this.props.onChange(this.state.value);
    }, 50);
  };

  render() {
    return (<input
      className="form-control"
      type="text"
      value={this.state.value}
      onChange={this.handleChange}
      placeholder={this.props.placeholder}
    />);
  }
}
