// @flow

import React from 'react';
import qs from 'qs';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import _ from 'lodash';

import Node from './Node';
import DataTable from './DataTable';
import SearchField from './SearchField';
import ContentHeader from './ContentHeader';
import ListActions from './ListActions';
import * as listRedux from '../redux/lists';
import * as userRedux from '../redux/user';
import akita from '../utils/akita';


const { object, func } = React.PropTypes;
const CHECK_ICON = <i className="fa fa-check"/>;

class List extends React.Component {

  static propTypes = {
    location: object
  };

  static contextTypes = {
    actions: object,
    views: object,
    settings: object,
    t: func,
    confirm: func,
    toast: func,
    router: object,
  };
  state: {
    data:any,
    search:string,
    filters:Object,
    page:number,
    list:Object,
    sort:string,
    columnsItems:any[],
    columnsKeys: any[],
    filterItems: any[],
    filterViews: any[],
    filterViewsMap: Object,
    selected: any[],
    model:any
  };

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
      model: {}
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
      let model = this.state.model;
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
    let title = props.title || this.props.title || model.label;
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
      title,
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
    return _.reduce(model.fields, (res, field, index) => {
      if (!field._label) {
        field._label = field.label;
        field.label = t(field.label, model.service.id);
      }
      if (field.hidden || !field.filter) return res;
      if (field.super && !settings.superMode) return res;
      let icon = filterViewsMap[field.path] ? CHECK_ICON : null;
      res.push(
        <MenuItem
          key={index}
          eventKey={field.path}
          className="with-icon"
        >{icon} {field.label}
        </MenuItem>
      );
      return res;
    }, []);
  }

  getColumnItems(model, columnsKeys) {
    const { settings } = this.context;
    return _.reduce(model.fields, (res, field, index) => {
      let icon = columnsKeys.indexOf(field.path) > -1 ? CHECK_ICON : null;
      if (field.hidden || !field.cell) return res;
      if (field.super && !settings.superMode) return res;
      res.push(
        <MenuItem
          key={index}
          eventKey={field.path}
          className="with-icon"
        >{icon} {field.label}
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
    this.props.list({ service, model, page, filters, search, key: state.model.key, sort });
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
    let query = { t: Date.now() };
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
    const { filters, filterViews, filterViewsMap, model } = this.state;
    if (filterViewsMap[eventKey]) {
      this.removeFilter(eventKey);
      return;
    }
    const field = model.fields[eventKey];
    const views = this.context.views;
    let FilterView = views[field.filter];
    let view;
    const onChange = (filter) => {
      let cFilters = _.assign({}, this.state.filters, { [field.path]: filter });
      this.setState({ cFilters, data: null, page: 0 }, () => {
        this.loadMore();
        this.updateQuery();
      });
    };
    const onClose = () => {
      this.removeFilter(field.path);
    };
    view = filterViewsMap[eventKey] =
      <FilterView key={eventKey} field={field} onChange={onChange} onClose={onClose} value={filters[eventKey]}/>;
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
  }
  handleScroll = () => {
    let body = document.body;
    if (body.scrollTop + document.documentElement.clientHeight >= body.scrollHeight) {
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
      await akita.post('/api/remove?' + qs.stringify({ service: model.service.id, model: model.name }),
        { id: record._id });
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
      title,
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
      <Node id="list">
        <ContentHeader actions={titleBtns}>
          {t(title, service.id)} &nbsp;
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
              onRefresh={this.refresh}
              refreshAction={this.props.refreshAction} />
          </div>
        </nav>
      </Node>
    );
  }
}

export default connect(({ lists }) => ({ lists }), (dispatch) => bindActionCreators({
  listAction: listRedux.list,
  refreshAction: userRedux.refreshInfo
}, dispatch))(List);
