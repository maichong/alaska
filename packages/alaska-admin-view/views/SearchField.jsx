// @flow

import React from 'react';

export default class SearchField extends React.Component {

  props: {
    value: string,
    onChange: Function
  };

  state: Object;
  _timer: any;

  constructor(props: Object) {
    super(props);
    this.state = {
      value: ''
    };
  }

  componentWillReceiveProps(props: Object) {
    if (props.value !== this.state.value) {
      this.setState({
        value: props.value
      });
    }
  }

  handleChange = (event: Object) => {
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
      className="form-control" type="text" value={this.state.value} onChange={this.handleChange}
      placeholder={this.props.placeholder}
    />);
  }
}
