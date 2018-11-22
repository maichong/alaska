import * as React from 'react';
import Node from './Node';
import { SearchFieldProps } from '..';

interface SearchFieldState {
  search: string;
}

export default class SearchField extends React.Component<SearchFieldProps, SearchFieldState> {
  constructor(props: SearchFieldProps) {
    super(props);
    this.state = {
      search: props.value || ''
    };
  }

  componentWillReceiveProps(props: SearchFieldProps) {
    if (props.value !== this.state.search) {
      this.setState({ search: props.value });
    }
  }

  handleChange = (event: any) => {
    let search = event.target.value;
    this.setState({ search });
  };

  handleBlur = () => {
    let search = this.state.search.trim();
    this.props.onChange(search);
  };

  handleKeyPress = (event: any) => {
    if (event.key === 'Enter') {
      this.handleBlur();
    }
  };

  handleClear = () => {
    this.setState({ search: '' });
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
          value={this.state.search}
          onChange={this.handleChange}
          onBlur={this.handleBlur}
          onKeyPress={this.handleKeyPress}
          placeholder={this.props.placeholder}
        />
        {this.state.search ?
          <div className="search-clear" onClick={this.handleClear}>
            <i className="fa fa-close" />
          </div> : null
        }
      </Node>);
  }
}

