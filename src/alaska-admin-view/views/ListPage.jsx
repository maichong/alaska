// @flow

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import _ from 'lodash';
import akita from 'akita';
import qs from 'qs';
import Node from './Node';
import DataTable from './DataTable';
import SearchField from './SearchField';
import TopToolbar from './TopToolbar';
import ListActions from './ListActions';
import * as listRedux from '../redux/lists';
import { refreshSettings } from '../redux/settings';

const CHECK_ICON = <i className="fa fa-check" />;

type Props = {
  location: Object,
  loadList: Function,
  refreshSettings: Function,
  match: Alaska$view$match<{
    service: string,
    model: string
  }>,
  lists: Alaska$view$lists
};

type ElementMap = { [key: string]: React$Element<any> };

type State = {
  service: Alaska$view$Service | null,
  model: Alaska$view$Model | null,
  records: null | Alaska$view$Record[],
  search: string,
  filters: Object,
  page: number,
  list: Alaska$view$RecordList,
  sort: string,
  columnsItems: Array<React$Element<any>>,
  columnsKeys: string[],
  filterItems: Array<React$Element<any>>,
  filterViews: Array<React$Element<any>>,
  filterViewsMap: ElementMap,
  selected: Alaska$view$Record[],
  query: {}
};

class ListPage extends React.Component<Props, State> {
  static contextTypes = {
    actions: PropTypes.object,
    views: PropTypes.object,
    settings: PropTypes.object,
    t: PropTypes.func,
    confirm: PropTypes.func,
    toast: PropTypes.func,
    router: PropTypes.object,
  };

  _loading: boolean;

  constructor(props: Props) {
    super(props);
    let search = (props.location.search || '').substr(1);
    let query: Object = qs.parse(search) || {};
    this.state = {
      records: null,
      search: query.search || '',
      filters: query.filters || {},
      page: 0,
      // $Flow
      list: {},
      sort: query.sort || '',
      columnsItems: [],
      columnsKeys: (query.columns || '').split('-').filter((a) => a),
      filterItems: [],
      filterViews: [],
      filterViewsMap: {},
      selected: [],
      model: null,
      service: null,
      query
    };
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll, false);
    this.init(this.props);
  }

  componentWillReceiveProps(nextProps: Props) {
    let search = (nextProps.location.search || '').substr(1);
    let query = qs.parse(search) || {};
    // $Flow
    let newState: State = { query };
    if (nextProps.match.params.model !== this.props.match.params.model) {
      this.init(nextProps);
    }
    let { lists } = nextProps;
    if (lists !== this.props.lists) {
      let { model } = this.state;
      if (model && lists[model.key]) {
        newState.list = lists[model.key];
        newState.records = lists[model.key].results;
      } else {
        // $Flow
        newState.list = {};
        newState.records = null;
      }
      this.setState(newState, () => {
        if (!newState.records) {
          this.refresh();
        }
      });
      this._loading = false;
    }
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll, false);
  }

  init(props) {
    const { settings } = this.context;
    let serviceId = props.match.params.service;
    let modelName = props.match.params.model;
    if (!serviceId || !modelName || !settings || !settings.services) return;
    let service = settings.services[serviceId];
    if (!service) return;
    let model = service.models[modelName];
    if (!model) return;
    let {
      records, sort, search, filters, filterViews, filterViewsMap, columnsKeys
    } = this.state;
    if (this.state.model && this.state.model.modelName !== model.modelName) {
      //更新了model
      records = null;
      filters = {};
      filterViews = [];
      filterViewsMap = {};
      columnsKeys = _.clone(model.defaultColumns);
      sort = '';
      search = '';
    }

    if (!this.state.model && !columnsKeys.length) {
      columnsKeys = _.clone(model.defaultColumns);
    }

    //filters
    let filterItems = this.getFilterItems(model, filterViewsMap);

    //columns
    let columnsItems = this.getColumnItems(model, columnsKeys);

    if (!sort) {
      sort = model.defaultSort.split(' ')[0];
    }
    this.setState({
      service,
      model,
      records: records || [],
      search,
      sort,
      filterItems,
      filters,
      filterViews,
      filterViewsMap,
      columnsItems,
      columnsKeys
    }, () => {
      _.forEach(filters, (value, path) => {
        if (!filterViewsMap[path]) {
          this.handleFilter(path);
        }
      });
      if (!records) {
        this.refresh();
      }
    });
  }

  getFilterItems(model: Alaska$view$Model, filterViewsMap: ElementMap): React$Element<any>[] {
    const { t, settings } = this.context;
    return _.reduce(model.fields, (res: Array<any>, field: Object) => {
      if (field.hidden || !field.filter) return res;
      if (field.super && !settings.superMode) return res;
      let icon = filterViewsMap[field.path] ? CHECK_ICON : null;
      res.push(<MenuItem
        key={field.path}
        eventKey={field.path}
        className="with-icon"
      >{icon} {t(field.label, model.serviceId)}
      </MenuItem>);
      return res;
    }, []);
  }

  getColumnItems(model: Alaska$view$Model, columnsKeys: string[]): React$Element<any>[] {
    const { settings, t } = this.context;
    return _.reduce(model.fields, (res: Array<any>, field: Object) => {
      let icon = columnsKeys.indexOf(field.path) > -1 ? CHECK_ICON : null;
      if (field.hidden || !field.cell) return res;
      if (field.super && !settings.superMode) return res;
      res.push(<MenuItem
        key={field.path}
        eventKey={field.path}
        className="with-icon"
      >{icon} {t(field.label, model.serviceId)}
      </MenuItem>);
      return res;
    }, []);
  }

  refresh = () => {
    this.setState({ page: 0 }, () => this.loadMore());
  };

  loadMore() {
    this._loading = true;
    let { state } = this;
    let {
      filters, search, sort, model
    } = state;
    if (!model) return;
    let page = (state.page || 0) + 1;
    this.props.loadList({
      service: model.serviceId, model: model.modelName, page, filters, search, key: model.key, sort
    });
    this.setState({ page });
  }

  removeFilter(path) {
    let { model } = this.state;
    if (!model) return;
    let filters = _.omit(this.state.filters, path);
    let filterViews = _.reduce(this.state.filterViews, (res, view) => {
      if (view.key !== path) {
        res.push(view);
      }
      return res;
    }, []);
    let filterViewsMap = _.omit(this.state.filterViewsMap, path);
    this.setState({
      filters,
      filterViews,
      filterViewsMap,
      filterItems: this.getFilterItems(model, filterViewsMap),
      records: null,
      page: 0
    }, () => {
      this.loadMore();
      this.updateQuery();
    });
  }

  updateQuery() {
    let query = {
      t: Date.now(), search: '', sort: '', filters: {}, columns: ''
    };
    const {
      filters, sort, search, columnsKeys
    } = this.state;
    if (search) {
      query.search = search;
    }
    if (sort) {
      query.sort = sort;
    }
    if (_.size(filters)) {
      query.filters = filters;
    }
    query.columns = columnsKeys.join('-');
    let { pathname } = this.props.location;
    this.context.router.history.replace({ pathname, search: '?' + qs.stringify(query) });
  }

  handleFilter = (eventKey) => {
    const {
      filters, filterViews, filterViewsMap, model
    } = this.state;
    if (filterViewsMap[eventKey]) {
      this.removeFilter(eventKey);
      return;
    }
    if (!model) return;
    let field = model.fields[eventKey];
    if (!field) return;

    const { views } = this.context;
    let FilterView = views[field.filter];
    let view;
    const onChange = (filter) => {
      let cFilters = _.assign({}, this.state.filters, { [field.path]: filter });
      this.setState({ filters: cFilters, records: null, page: 0 }, () => {
        this.loadMore();
        this.updateQuery();
      });
    };
    const onClose = () => {
      this.removeFilter(field.path);
    };
    let className = model.id + '-' + field.path + '-filter row field-filter';
    view = <FilterView
      key={eventKey}
      className={className}
      field={field}
      onChange={onChange}
      onClose={onClose}
      value={filters[eventKey]}
    />;
    filterViewsMap[eventKey] = view;
    filterViews.push(view);
    this.setState({ filterViews, filterViewsMap, filterItems: this.getFilterItems(model, filterViewsMap) });
  };

  handleSort = (sort) => {
    this.setState({ sort, records: null }, () => {
      this.refresh();
      this.updateQuery();
    });
  };

  handleSearch = (search) => {
    this.setState({ search, records: [] }, () => {
      this.refresh();
      this.updateQuery();
    });
  };

  handleScroll = () => {
    // $Flow
    if (window.scrollY + window.innerHeight >= document.body.scrollHeight) {
      if (!this.state.list.next || this._loading) return;
      this.loadMore();
    }
  };

  handleColumn = (eventKey: string) => {
    let { model } = this.state;
    if (!model) return;
    let columnsKeys = this.state.columnsKeys.slice();
    if (columnsKeys.indexOf(eventKey) > -1) {
      _.pull(columnsKeys, eventKey);
    } else {
      columnsKeys.push(eventKey);
    }
    this.setState({
      columnsKeys,
      columnsItems: this.getColumnItems(model, columnsKeys)
    }, () => this.updateQuery());
  };

  handleSelect = (selected) => {
    this.setState({ selected });
  };

  handleRemove = async(record: Alaska$view$Record) => {
    const { model } = this.state;
    if (!model) return;
    const { t, toast, confirm } = this.context;
    await confirm(t('Remove record'), t('confirm remove record'));
    try {
      await akita.post('/api/remove', {
        params: {
          _service: model.serviceId,
          _model: model.modelName
        },
        body: { id: record._id }
      });
      toast('success', t('Successfully'));
      this.refresh();
    } catch (error) {
      toast('error', t('Failed'), error.message);
    }
  };

  render() {
    const {
      search,
      service,
      model,
      records,
      list,
      sort,
      filterItems,
      filterViews,
      columnsItems,
      columnsKeys,
      selected,
      query
    } = this.state;
    if (!service || !model) {
      return <div className="loading">Loading...</div>;
    }
    const { t } = this.context;
    let titleBtns = [];

    if (!query.nofilter && filterItems.length) {
      titleBtns.push(<DropdownButton
        id="listFilterDropdown"
        key="listFilterDropdown"
        title={<i className="fa fa-filter" />}
        onSelect={this.handleFilter}
      >{filterItems}
      </DropdownButton>);
    }

    if (!query.nocolumns) {
      titleBtns.push(<DropdownButton
        id="columnsDropdown"
        key="columnsDropdown"
        title={<i className="fa fa-columns" />}
        onSelect={this.handleColumn}
      >{columnsItems}
      </DropdownButton>);
    }

    if (!query.norefresh) {
      titleBtns.push(<button
        key="refresh"
        className="btn btn-primary"
        onClick={this.refresh}
      ><i className="fa fa-refresh" />
      </button>);
    }

    let handleSelect;
    if (!model.noremove || _.find(model.actions, (a) => (a.list && a.list))) {
      // eslint-disable-next-line prefer-destructuring
      handleSelect = this.handleSelect;
    }

    let handleRemove;
    if (!model.noremove && model.abilities.remove) {
      // eslint-disable-next-line prefer-destructuring
      handleRemove = this.handleRemove;
    }

    return (
      <Node id="list" className={model.serviceId + '-' + model.id}>
        <TopToolbar actions={titleBtns}>
          {t(model.label || model.modelName, service.id)}
          {search ? <i>  &nbsp; ( {t('Search')} : {search} ) </i> : null}
          &nbsp; <i>{list.total !== undefined ? t('total records', { total: list.total }) : null}</i>
        </TopToolbar>
        <div>{filterViews}</div>
        <div className="panel panel-default noborder">
          <div className="scroll">
            <DataTable
              model={model}
              records={records || []}
              sort={sort}
              onSort={this.handleSort}
              onSelect={handleSelect}
              onRemove={handleRemove}
              selected={selected}
              columns={columnsKeys}
            />
          </div>
        </div>
        <nav className="navbar navbar-fixed-bottom bottom-toolbar">
          <div className="container-fluid">
            <div className="navbar-form navbar-left">
              <div className="form-group">
                {model.searchFields.length ?
                  <SearchField
                    placeholder={t('Press enter to search')}
                    onChange={this.handleSearch}
                    value={search}
                  /> : null
                }
              </div>
            </div>
            <ListActions
              model={model}
              records={records || []}
              selected={selected}
              refresh={this.refresh}
              refreshSettings={this.props.refreshSettings}
            />
          </div>
        </nav>
      </Node>
    );
  }
}

export default connect(({ lists }) => ({ lists }), (dispatch) => bindActionCreators({
  loadList: listRedux.loadList,
  refreshSettings
}, dispatch))(ListPage);
