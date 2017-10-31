// @flow

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import _ from 'lodash';
import akita from 'akita';
import Node from './Node';
import DataTable from './DataTable';
import SearchField from './SearchField';
import ContentHeader from './ContentHeader';
import ListActions from './ListActions';
import * as listRedux from '../redux/lists';
import { refreshSettings } from '../redux/settings';
import type { Lists, Service, Model, Record } from '../types';

const CHECK_ICON = <i className="fa fa-check" />;

class ListPage extends React.Component {

  static contextTypes = {
    actions: PropTypes.object,
    views: PropTypes.object,
    settings: PropTypes.object,
    t: PropTypes.func,
    confirm: PropTypes.func,
    toast: PropTypes.func,
    router: PropTypes.object,
  };

  props: {
    location: Object,
    loadList: Function,
    refreshSettings: Function;
    params: {
      service: string;
      model: string
    };
    lists: Lists
  };

  state: {
    data?: Record,
    search: string,
    filters: Object,
    page: number,
    list: Object,
    sort: string,
    columnsItems: any[],
    columnsKeys: any[],
    filterItems: any[],
    filterViews: any[],
    filterViewsMap: Object,
    selected: any[],
    model: Model,
    service: Service
  };

  _loading: boolean;

  constructor(props: Object) {
    super(props);
    let query = props.location.query || {};
    this.state = {
      data: null,
      search: query.search || '',
      filters: query.filters || {},
      page: 0,
      list: {},
      sort: query.sort || '',
      columnsItems: [],
      columnsKeys: (query.columns || '').split('-').filter((a) => a),
      filterItems: [],
      filterViews: [],
      filterViewsMap: {},
      selected: [],
      model: null,
      service: null
    };
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll, false);
    this.init(this.props);
  }

  componentWillReceiveProps(nextProps: Object) {
    let newState = {};
    if (nextProps.params.model !== this.props.params.model) {
      this.init(nextProps);
    }
    if (nextProps.lists && nextProps.lists !== this.props.lists) {
      let lists = nextProps.lists;
      let model: Model = this.state.model;
      if (lists[model.key]) {
        newState.list = lists[model.key];
        newState.data = lists[model.key].results;
      } else {
        newState.list = {};
        newState.data = null;
      }
      this.setState(newState, () => {
        if (!newState.data) {
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
    let settings = this.context.settings;
    let serviceId = props.params.service;
    let modelName = props.params.model;
    if (!serviceId || !modelName || !settings || !settings.services) return;
    let service = settings.services[serviceId];
    if (!service) return;
    let model = service.models[modelName];
    if (!model) return;
    let data = this.state.data;
    let sort = this.state.sort;
    let search = this.state.search;
    let filters = this.state.filters;
    let filterViews = this.state.filterViews;
    let filterViewsMap = this.state.filterViewsMap;
    let columnsKeys = this.state.columnsKeys;
    if (this.state.model && this.state.model.name !== model.name) {
      //更新了model
      data = null;
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
      data: data || [],
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
      if (!data) {
        this.refresh();
      }
    });
  }

  getFilterItems(model, filterViewsMap) {
    const { t, settings } = this.context;
    return _.reduce(model.fields, (res: Array<any>, field: Object) => {
      if (field.hidden || !field.filter) return res;
      if (field.super && !settings.superMode) return res;
      let icon = filterViewsMap[field.path] ? CHECK_ICON : null;
      res.push(
        <MenuItem
          key={field.path}
          eventKey={field.path}
          className="with-icon"
        >{icon} {t(field.label, model.serviceId)}
        </MenuItem>
      );
      return res;
    }, []);
  }

  getColumnItems(model, columnsKeys) {
    const { settings, t } = this.context;
    return _.reduce(model.fields, (res: Array<any>, field: Object) => {
      let icon = columnsKeys.indexOf(field.path) > -1 ? CHECK_ICON : null;
      if (field.hidden || !field.cell) return res;
      if (field.super && !settings.superMode) return res;
      res.push(
        <MenuItem
          key={field.path}
          eventKey={field.path}
          className="with-icon"
        >{icon} {t(field.label, model.serviceId)}
        </MenuItem>
      );
      return res;
    }, []);
  }

  refresh = () => {
    this.setState({ page: 0 }, () => this.loadMore());
  };

  loadMore() {
    this._loading = true;
    let props = this.props;
    let state = this.state;
    let service = props.params.service;
    let model = props.params.model;
    let page = (state.page || 0) + 1;
    let filters = state.filters;
    let search = state.search;
    let sort = state.sort;
    this.props.loadList({ service, model, page, filters, search, key: state.model.key, sort });
    this.setState({ page });
  }

  removeFilter(path) {
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
      filterItems: this.getFilterItems(this.state.model, filterViewsMap),
      data: null,
      page: 0
    }, () => {
      this.loadMore();
      this.updateQuery();
    });
  }

  updateQuery() {
    let query = { t: Date.now(), search: '', sort: '', filters: {}, columns: '' };
    const { filters, sort, search, columnsKeys } = this.state;
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
    let pathname = this.props.location.pathname;
    let state = this.props.location.state;
    this.context.router.replace({ pathname, query, state });
  }

  handleFilter = (eventKey) => {
    const { t } = this.context;
    const { filters, filterViews, filterViewsMap, model } = this.state;
    if (filterViewsMap[eventKey]) {
      this.removeFilter(eventKey);
      return;
    }
    let field = model.fields[eventKey];
    if (!field) return;

    const views = this.context.views;
    let FilterView = views[field.filter];
    let view;
    const onChange = (filter) => {
      let cFilters = _.assign({}, this.state.filters, { [field.path]: filter });
      this.setState({ filters: cFilters, data: null, page: 0 }, () => {
        this.loadMore();
        this.updateQuery();
      });
    };
    const onClose = () => {
      this.removeFilter(field.path);
    };
    let className = model.id + '-' + field.path + '-filter row field-filter';
    view = filterViewsMap[eventKey] = <FilterView
      key={eventKey}
      className={className}
      field={field}
      onChange={onChange}
      onClose={onClose}
      value={filters[eventKey]}
    />;
    filterViews.push(view);
    this.setState({ filterViews, filterViewsMap, filterItems: this.getFilterItems(model, filterViewsMap) });
  };

  handleSort = (sort) => {
    this.setState({ sort, data: null }, () => {
      this.refresh();
      this.updateQuery();
    });
  };

  handleSearch = (search) => {
    this.setState({ search, data: [] }, () => {
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

  handleColumn = (eventKey) => {
    let columnsKeys = this.state.columnsKeys.slice();
    if (columnsKeys.indexOf(eventKey) > -1) {
      _.pull(columnsKeys, eventKey);
    } else {
      columnsKeys.push(eventKey);
    }
    this.setState({
      columnsKeys,
      columnsItems: this.getColumnItems(this.state.model, columnsKeys)
    }, () => this.updateQuery());
  };

  handleSelect = (selected) => {
    this.setState({ selected });
  };

  handleRemove = async(record) => {
    const { model } = this.state;
    const { t, toast, confirm } = this.context;
    await confirm(t('Remove record'), t('confirm remove record'));
    try {
      await akita.post('/api/remove', {
        params: {
          _service: model.serviceId,
          _model: model.name
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
    const { location } = this.props;
    const {
      search,
      service,
      model,
      data,
      list,
      sort,
      filterItems,
      filterViews,
      columnsItems,
      columnsKeys,
      selected
    } = this.state;
    if (!model) {
      return <div className="loading">Loading...</div>;
    }
    const t = this.context.t;
    let titleBtns = [];

    if (!location.query.nofilter && filterItems.length) {
      titleBtns.push(
        <DropdownButton
          id="listFilterDropdown" key="listFilterDropdown"
          title={<i className="fa fa-filter" />}
          onSelect={this.handleFilter}
        >{filterItems}</DropdownButton>);
    }

    if (!location.query.nocolumns) {
      titleBtns.push(
        <DropdownButton
          id="columnsDropdown" key="columnsDropdown"
          title={<i className="fa fa-columns" />}
          onSelect={this.handleColumn}
        >{columnsItems}</DropdownButton>);
    }

    if (!location.query.norefresh) {
      titleBtns.push(
        <button
          key="refresh"
          className="btn btn-primary"
          onClick={this.refresh}
        ><i className="fa fa-refresh" />
        </button>);
    }

    let searchInput = model.searchFields.length ?
      <SearchField placeholder={t('Search')} onChange={this.handleSearch} value={search} /> : null;

    let handleSelect;
    if (!model.noremove || _.find(model.actions, (a) => a.list)) {
      handleSelect = this.handleSelect;
    }

    let handleRemove;
    if (!model.noremove && model.abilities.remove) {
      handleRemove = this.handleRemove;
    }

    return (
      <Node id="list" className={model.serviceId + '-' + model.id}>
        <ContentHeader actions={titleBtns}>
          {t(model.label || model.name, service.id)} &nbsp;
          <i>{t('total records', { total: list.total })}</i>
        </ContentHeader>
        <div>{filterViews}</div>
        <div className="panel panel-default noborder">
          <div className="scroll">
            <DataTable
              model={model}
              data={data}
              sort={sort}
              onSort={this.handleSort}
              onSelect={handleSelect}
              onRemove={handleRemove}
              selected={selected}
              columns={columnsKeys}
            />
          </div>
        </div>
        <nav className="navbar navbar-fixed-bottom bottom-bar">
          <div className="container-fluid">
            <div className="navbar-form navbar-left">
              <div className="form-group">
                {searchInput}
              </div>
            </div>
            <ListActions
              model={model} selected={selected}
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
