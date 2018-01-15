// @flow

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router-dom';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import _ from 'lodash';
import akita from 'akita';
import qs from 'qs';
import Immutable from 'seamless-immutable';
import type { ImmutableObject, ImmutableArray } from 'seamless-immutable';
import Node from './Node';
import DataTable from './DataTable';
import SearchField from './SearchField';
import TopToolbar from './TopToolbar';
import ListActions from './ListActions';
import QuickEditor from './QuickEditor';
import * as listRedux from '../redux/lists';
import { refreshSettings } from '../redux/settings';
import parseAbility from '../utils/parse-ability';

const CHECK_ICON = <i className="fa fa-check" />;
// $Flow
const EMPTY_RECORD_LIST: ImmutableArray<Alaska$view$Record> = Immutable([]);

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
  records: null | ImmutableArray<Alaska$view$Record>,
  search: string,
  filters: Object,
  page: number,
  list: Alaska$view$RecordList,
  sort: string,
  columnsItems: React$Element<any>[],
  columnsKeys: string[],
  filterItems: React$Element<any>[],
  filterViews: React$Element<any>[],
  filterViewsMap: ElementMap,
  selected: ImmutableArray<Alaska$view$Record>,
  activated?: ImmutableObject<Alaska$view$Record>,
  query: {}
};

class ListPage extends React.Component<Props, State> {
  static contextTypes = {
    views: PropTypes.object,
    settings: PropTypes.object,
    t: PropTypes.func,
    confirm: PropTypes.func,
    toast: PropTypes.func,
    router: PropTypes.object,
  };

  _loading: boolean;
  _ref: ?HTMLElement;

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
      selected: EMPTY_RECORD_LIST,
      model: null,
      service: null,
      query
    };
  }

  componentDidMount() {
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
        newState.activated = undefined;
        newState.selected = EMPTY_RECORD_LIST;
      }
      this.setState(newState, () => {
        if (!newState.records) {
          this.refresh();
        }
      });
      this._loading = false;
    }
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
      sort, filters, filterViewsMap, columnsKeys
    } = this.state;

    let newState = {};
    newState.service = service;
    newState.model = model;
    newState.filterViewsMap = filterViewsMap;
    if (this.state.model && this.state.model.modelName !== model.modelName) {
      //更新了model
      newState.records = null;
      newState.filters = {};
      newState.filterViews = [];
      newState.filterViewsMap = {};
      newState.columnsKeys = _.clone(model.defaultColumns);
      newState.sort = '';
      newState.search = '';
      newState.activated = undefined;
      newState.selected = EMPTY_RECORD_LIST;
    }

    if (!this.state.model && !columnsKeys.length) {
      newState.columnsKeys = _.clone(model.defaultColumns);
    }

    //filters
    newState.filterItems = this.getFilterItems(model, newState.filterViewsMap);

    //columns
    newState.columnsItems = this.getColumnItems(model, columnsKeys);

    if (!sort) {
      newState.sort = model.defaultSort.split(' ')[0];
    }
    this.setState(newState, () => {
      _.forEach(filters, (value, path) => {
        if (!newState.filterViewsMap[path]) {
          this.handleFilter(path);
        }
      });
      if (!this.state.records) {
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
    // $Flow
    this.setState({ page: 0, selected: EMPTY_RECORD_LIST, activated: undefined }, () => this.loadMore());
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

  canCreate = (): boolean => {
    const { model } = this.state;
    const { settings } = this.context;
    if (!model || model.nocreate) return false;
    let ability = _.get(model, 'actions.create.ability');
    if (ability) {
      ability = parseAbility(ability);
      if (ability && !settings.abilities[ability]) return false;
    } else if (!model.abilities.create) return false;
    return true;
  };

  canUpdate = (): boolean => {
    const { model } = this.state;
    const { settings } = this.context;
    if (!model || model.noupdate) return false;
    let ability = _.get(model, 'actions.update.ability');
    if (ability) {
      ability = parseAbility(ability);
      if (ability && !settings.abilities[ability]) return false;
    } else if (!model.abilities.update) return false;
    return true;
  };

  canRemove = (): boolean => {
    const { model } = this.state;
    const { settings } = this.context;
    if (!model || model.noremove) return false;
    let ability = _.get(model, 'actions.remove.ability');
    if (ability) {
      ability = parseAbility(ability);
      if (ability && !settings.abilities[ability]) return false;
    } else if (!model.abilities.remove) return false;
    return true;
  };

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

    if (field && field.filter) {
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

      this.setState({
        filterViews, filterViewsMap, filterItems: this.getFilterItems(model, filterViewsMap)
      });
    } else {
      delete filterViewsMap[eventKey];
      delete filters[eventKey];
      this.setState({ filters, records: null, page: 0 }, () => {
        this.updateQuery();
      });
    }
  };

  handleSort = (sort) => {
    this.setState({ sort, records: null }, () => {
      this.refresh();
      this.updateQuery();
    });
  };

  handleSearch = (search) => {
    this.setState({ search, records: EMPTY_RECORD_LIST }, () => {
      this.refresh();
      this.updateQuery();
    });
  };

  handleScroll = () => {
    const ref = this._ref;
    if (!ref || this._loading || !this.state.list.next) return;
    if ((ref.scrollHeight - (ref.offsetHeight + ref.scrollTop)) < 50) {
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
    let newState = { selected };
    if (this.state.activated && !selected.length) {
      // $Flow
      newState.activated = undefined;
    } else if (selected.length && !this.state.activated) {
      // $Flow
      newState.activated = selected[0];
    }
    this.setState(newState);
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

  handleActive = (record) => {
    let { selected } = this.state;
    let newState = { activated: record };
    if (!selected.length || (selected.length === 1 && selected[0] !== record)) {
      // $Flow
      newState.selected = Immutable([record]);
    }
    this.setState(newState);
  };

  renderToolbar() {
    const { t } = this.context;
    const {
      model, service, search, list, query, filterItems, columnsItems, records
    } = this.state;
    if (!model || !service) return null;

    let titleBtns = [];

    if (records && records.length && !query.nofilter && filterItems.length) {
      titleBtns.push(<DropdownButton
        id="listFilterDropdown"
        key="listFilterDropdown"
        title={<i className="fa fa-filter" />}
        onSelect={this.handleFilter}
      >{filterItems}
      </DropdownButton>);
    }

    if (records && records.length && !query.nocolumns) {
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
    return (
      <TopToolbar actions={titleBtns}>
        {t(model.label || model.modelName, service.id)}
        {search ? <i>  &nbsp; ( {t('Search')} : {search} ) </i> : null}
        &nbsp; <i>{list.total !== undefined ? t('total records', { total: list.total }) : null}</i>
      </TopToolbar>
    );
  }

  renderBottomBar() {
    const { t } = this.context;
    const {
      model, search, records, selected
    } = this.state;
    if (!model) return null;
    return (
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
            records={records || EMPTY_RECORD_LIST}
            selected={selected}
            refresh={this.refresh}
            refreshSettings={this.props.refreshSettings}
          />
        </div>
      </nav>
    );
  }

  renderEmpty() {
    const { model } = this.state;
    const { t } = this.context;
    let link = null;

    if (this._loading || !model) return null;

    if (this.canCreate()) {
      link = <Link to={`/edit/${model.serviceId}/${model.modelName}/_new`}>{t('Create')}</Link>;
    }
    return (
      <div className="error-info">
        <div className="error-info-title">{t('No data!')}</div>
        <div className="error-info-desc">
          {t('No records found.')} &nbsp; {link}
        </div>
      </div>
    );
  }

  render() {
    const {
      service,
      model,
      records,
      sort,
      filterViews,
      columnsKeys,
      selected,
      activated
    } = this.state;
    if (!service || !model) {
      return <div className="loading">Loading...</div>;
    }

    let { handleRemove } = this;
    if (model.noremove) {
      handleRemove = undefined;
    } else {
      // 判断权限
      let ability = _.get(model, 'actions.remove.ability');
      if (ability) {
        // 存在自定义权限
        if (!this.context.settings.abilities[ability]) {
          handleRemove = undefined;
        }
      } else if (!model.abilities.remove) {
        handleRemove = undefined;
      }
    }

    const quickEditor = model.quickEditorView !== false && (activated || selected.length) && window.innerWidth > 600;

    let className = 'list-page ' + model.serviceId + '-' + model.id;
    if (this.canCreate()) {
      className += ' can-create';
    } else {
      className += ' no-create';
    }
    if (this.canUpdate()) {
      className += ' can-update';
    } else {
      className += ' no-update';
    }
    if (this.canRemove()) {
      className += ' can-remove';
    } else {
      className += ' no-remove';
    }

    return (
      <Node id="listPage" className={className}>
        <div
          className={'list-page-inner' + (quickEditor ? ' with-editor' : '')}
          onScroll={this.handleScroll}
          ref={(r) => {
            this._ref = r;
          }}
        >
          {this.renderToolbar()}
          <div>{filterViews}</div>
          {
            records && records.length ?
              <div className="panel panel-default noborder list-panel">
                <DataTable
                  canDrag
                  model={model}
                  records={records || EMPTY_RECORD_LIST}
                  sort={sort}
                  onSort={this.handleSort}
                  onSelect={this.handleSelect}
                  onRemove={handleRemove}
                  onActive={this.handleActive}
                  selected={selected}
                  activated={activated}
                  columns={columnsKeys}
                />
              </div>
              : this.renderEmpty()
          }
          {this.renderBottomBar()}
        </div>
        {
          model.quickEditorView === false
            ? null
            : (
              <QuickEditor
                model={model}
                record={activated}
                records={selected}
                onCancel={() => this.setState({ activated: undefined, selected: EMPTY_RECORD_LIST })}
                onRefresh={this.refresh}
              />
            )
        }
      </Node>
    );
  }
}

export default connect(({ lists }) => ({ lists }), (dispatch) => bindActionCreators({
  loadList: listRedux.loadList,
  refreshSettings
}, dispatch))(ListPage);
