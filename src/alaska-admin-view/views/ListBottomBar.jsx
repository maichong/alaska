//@flow

import React from 'react';
import PropTypes from 'prop-types';
import SearchField from './SearchField';
import ListActions from './ListActions';

type Props = {
  model: Alaska$view$Model,
  search?: string,
  filters: Object,
  sort?: string,
  records: ImmutableArray<Alaska$view$Record>,
  selected: ImmutableArray<Alaska$view$Record>,
  onSearch: Function,
  onRefresh: Function,
  onRefreshSettings: Function,
};

type State = {
  searchMode?: boolean
};

export default class ListBottomBar extends React.Component<Props, State> {
  static contextTypes = {
    t: PropTypes.func
  };

  state = {};

  handleCancel = () => {
    this.setState({ searchMode: false });
  };

  render() {
    const {
      model, onSearch, search, filters, sort, selected, records, onRefresh, onRefreshSettings
    } = this.props;
    if (!model) return null;
    const { t } = this.context;

    const { searchMode } = this.state;
    const canSearch = model.searchFields.length;

    let className = 'navbar navbar-fixed-bottom bottom-toolbar list-bottom-toolbar';
    if (canSearch && searchMode) {
      className += ' search-mode';
    }

    return (
      <nav className={className}>
        <div className="container-fluid">
          <div className="navbar-form navbar-left">
            {
              canSearch ? <div className="form-group">
                <i className="fa fa-search icon-btn" onClick={() => this.setState({ searchMode: true })} />
                <SearchField
                  placeholder={t('Press enter to search')}
                  onChange={onSearch}
                  value={search}
                />
              </div> : null
            }
          </div>
          <div className="navbar-right cancel-search">
            <div className="btn btn-default" onClick={this.handleCancel}>{t('Cancel')}</div>
          </div>
          <ListActions
            model={model}
            filters={filters}
            search={search}
            sort={sort}
            records={records}
            selected={selected}
            refresh={onRefresh}
            refreshSettings={onRefreshSettings}
          />
        </div>
      </nav>
    );
  }
}
