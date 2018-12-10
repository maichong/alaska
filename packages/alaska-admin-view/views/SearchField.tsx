import * as React from 'react';
import Node from './Node';
import { SearchFieldProps } from '..';

interface SearchFieldState {
  _value: string;
  input: string;
}

export default class SearchField extends React.Component<SearchFieldProps, SearchFieldState> {
  constructor(props: SearchFieldProps) {
    super(props);
    this.state = {
      _value: props.value,
      input: props.value || ''
    };
  }

  static getDerivedStateFromProps(nextProps: SearchFieldProps, prevState: SearchFieldState) {
    if (nextProps.value !== prevState._value && nextProps.value !== prevState.input) {
      return {
        _value: nextProps.value,
        search: nextProps.value
      };
    }
    return null;
  }

  handleChange = (event: any) => {
    let input = event.target.value;
    this.setState({ input });
  };

  handleBlur = () => {
    let search = this.state.input.trim();
    this.props.onChange(search);
  };

  handleKeyPress = (event: any) => {
    if (event.key === 'Enter') {
      this.handleBlur();
    }
  };

  handleClear = () => {
    this.setState({ input: '' });
    if (this.props.value) {
      this.props.onChange('');
    }
  };

  render() {
    return (
      <Node className="search-field" wrapper="SearchField" props={this.props}>
        <input
          className="form-control"
          type="search"
          value={this.state.input}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          onKeyPress={this.handleKeyPress}
          placeholder={this.props.placeholder}
        />
        {this.state.input ?
          <div className="search-clear" onClick={this.handleClear}>
            <i className="fa fa-close" />
          </div> : null
        }
      </Node>);
  }
}

