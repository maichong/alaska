/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-04-20
 * @author Liang <liang@maichong.it>
 */

import React from 'react';

const { string, func } = React.PropTypes;

export default class SearchField extends React.Component {

  static propTypes = {
    value: string,
    onChange: func,
  };

  constructor(props) {
    super(props);
    this.state = {
      value: ''
    };
  }

  componentWillReceiveProps(props) {
    if (props.value !== this.state.value) {
      this.setState({
        value: props.value
      });
    }
  }

  handleChange = (event) => {
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
    return <input className="form-control" type="text" value={this.state.value} onChange={this.handleChange}
                  placeholder={this.props.placeholder}/>;
  }
}
