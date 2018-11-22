import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as tr from 'grackle';
import Node from './Node';
import ListActions from './ListActions';
import { ListActionBarProps } from '..';
import SearchField from './SearchField';

interface ListActionBarState {
  searchMode?: boolean;
}

export default class ListActionBar extends React.Component<ListActionBarProps, ListActionBarState> {
  static contextTypes = {
    settings: PropTypes.object,
    router: PropTypes.object,
  };

  constructor(props: ListActionBarProps) {
    super(props);
    this.state = {};
  }

  handleCancel = () => {
    this.setState({ searchMode: false });
  };

  render() {
    const { model, filters, records, selected, sort, search, onSearch } = this.props;

    const { searchMode } = this.state;
    const canSearch = model.searchFields.length;

    let className = 'list-action-bar';
    if (canSearch && searchMode) {
      className += ' search-mode';
    }
    return (
      <Node
        className={className}
        wrapper="ListActionBar"
        props={this.props}
      >
        <div className="container-fluid">
          <div className="action-bar-form">
            {
              canSearch ? <div className="form-group">
                <i className="fa fa-search" onClick={() => this.setState({ searchMode: true })} />
                <SearchField
                  placeholder={tr('Press enter to search')}
                  value={search}
                  onChange={onSearch}
                />
              </div> : null
            }
          </div>
          <div className="cancel-search">
            <div className="btn btn-light" onClick={this.handleCancel}>{tr('Cancel')}</div>
          </div>
          <ListActions
            model={model}
            filters={filters}
            records={records}
            selected={selected}
            sort={sort}
            search={search}
          />
        </div>
      </Node>
    );
  }
}
