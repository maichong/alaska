import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as immutable from 'seamless-immutable';
import * as tr from 'grackle';
import * as qs from 'qs';
import * as _ from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Filters } from 'alaska-model';
import Node from './Node';
import ListToolbar from './ListToolbar';
import FilterEditor from './FilterEditor';
import List from './List';
import ListActionBar from './ListActionBar';
import QuickEditor from './QuickEditor';
import LoadingPage from './LoadingPage';
import * as listsRedux from '../redux/lists';
import {
  ListPageProps, ListsState, StoreState, Record, Model, Settings,
  Service, RouterProps, views
} from '..';
import { getStorage, setStorage } from '../utils/storage';

interface Props extends ListPageProps, RouterProps<{ service: string; model: string; }> {
  settings: Settings;
  lists: ListsState;
  loadMore: Function;
}

interface ListPageOptions {
  [key: string]: any;
}

interface ListPageState {
  records: immutable.Immutable<Record[]>;
  activated: immutable.Immutable<Record> | null;
  recordTotal: number;
  model: Model | null;
  selected: immutable.Immutable<Record[]>;
  options: ListPageOptions;
  sort: string;
  filters: Filters;
  columns: string;
  split: boolean;
}

class ListPage extends React.Component<Props, ListPageState> {
  _ref?: {
    scrollHeight: number;
    offsetHeight: number;
    scrollTop: number;
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      records: immutable([]),
      activated: null,
      recordTotal: 0,
      model: null,
      selected: immutable([]),
      options: {},
      sort: '',
      filters: {},
      columns: '',
      split: getStorage('split')
    };
  }

  componentDidMount() {
    this.init(this.props);
  }

  componentWillReceiveProps(nextProps: Props) {
    this.init(nextProps);
  }

  init(props: Props) {
    const { match, lists, settings } = props;
    const { params } = match;
    let nextState = {} as ListPageState;

    let serviceModels: Service = settings.services[params.service];
    nextState.records = immutable([]);
    nextState.recordTotal = 0;
    if (serviceModels && serviceModels.models) {
      let model = serviceModels.models[params.model] || null;
      let list;
      if (model) {
        list = lists[model.id];
        if (list) {
          nextState.records = list.results;
          nextState.recordTotal = list.total;
        }
      }
      nextState.model = model;
      if (!model || !nextState.records.length) {
        nextState.selected = immutable([]);
        nextState.activated = null;
      }
    }

    let searchString = (props.location.search || '').substr(1);
    let query = qs.parse(searchString) || {};
    let columns = (query._columns || '').replace(/,/g, ' ');
    if (!columns && nextState.model) {
      columns = nextState.model.defaultColumns;
    }
    if (!_.isEqual(columns, this.state.columns)) {
      nextState.columns = columns;
    }
    let sort = query._sort || '';
    if (sort !== this.state.sort) {
      nextState.sort = sort;
    }

    let queryObject: Object = _.omit(query, ['_columns', '_sort']);
    let filters = {} as Filters;
    let options = {} as ListPageOptions;
    _.mapKeys(queryObject, (v: any, k: string) => {
      if (k !== '_search' && k[0] === '_') {
        k = k.substr(1);
        options[k] = v;
        return;
      }
      filters[k] = v;
    });
    if (!_.isEqual(options, this.state.options)) {
      nextState.options = options;
    }
    if (!_.isEqual(filters, this.state.filters)) {
      nextState.filters = filters;
    }
    this.setState(nextState);
  }

  updateQuery() {
    let query: { [key: string]: any } = {};
    const {
      model, filters, sort, options, columns
    } = this.state;
    if (!model) return;
    if (sort && sort !== model.defaultSort) {
      query._sort = sort;
    }
    if (columns !== model.defaultColumns) {
      query._columns = columns.replace(/ /g, ',');
    }
    let optionsTemp = {};
    if (options && _.size(options)) {
      optionsTemp = _.mapKeys(options, (v, k) => {
        if (k[0] !== '_') {
          k = `_${k}`;
          return k;
        }
        return k;
      });
    }
    _.assign(query, filters, optionsTemp);
    let { pathname } = this.props.location;
    this.props.history.replace({ pathname, search: `?${qs.stringify(query, { encode: false })}` });
  }

  handleScroll = () => {
    const ref = this._ref;
    if (!ref) return;
    if ((ref.scrollHeight - (ref.offsetHeight + ref.scrollTop)) < 200) {
      const { match, loadMore, settings, lists } = this.props;
      const { params } = match;
      let serviceModels: Service = settings.services[params.service];
      if (serviceModels && serviceModels.models) {
        let model = serviceModels.models[params.model] || null;
        let list;
        if (model) {
          list = lists[model.id];
          if (list.next && !list.fetching) {
            loadMore({ model: model.id });
          }
        }
      }
    }
  };

  handleSort = (sort: string) => {
    this.setState({ sort }, () => {
      this.updateQuery();
    });
  };

  handleFilters = (filters: Filters) => {
    this.setState({ filters }, () => {
      this.updateQuery();
    });
  };

  handleSplit = (split: boolean) => {
    this.setState({ split });
    setStorage('split', split);
  };

  handleColumns = (columns: string) => {
    this.setState({ columns }, () => {
      this.updateQuery();
    });
  };

  handleSelect = (selected: immutable.Immutable<Record[]>) => {
    //@ts-ignore
    let nextState = { selected, activated: null };
    if (selected.length && !this.state.activated) {
      nextState.activated = selected[0];
    }
    this.setState(nextState);
  };

  handleActive = (record: immutable.Immutable<Record>) => {
    let { selected } = this.state;
    let nextState = {} as ListPageState;
    if (!selected.length || (selected.length === 1 && selected[0] !== record)) {
      nextState.selected = immutable([record]);
    }
    nextState.activated = record;
    this.setState(nextState);
  };

  render() {
    const {
      model,
      sort,
      filters,
      options,
      columns,
      selected,
      split,
      recordTotal,
      records,
      activated
    } = this.state;
    if (!model) {
      return <LoadingPage />;
    }
    let className = [
      'page',
      'list-page',
      `${model.serviceId}-${model.id}`,
      model.canCreate ? 'can-create' : 'no-create',
      model.canUpdate ? 'can-update' : 'no-update',
      model.canRemove ? 'can-remove' : 'no-remove',
    ].join(' ');

    let FilterEditorView = FilterEditor;
    if (model.filterEditorView && views.components.hasOwnProperty(model.filterEditorView)) {
      // @ts-ignore
      FilterEditorView = views.components[model.filterEditorView];
    }
    return (
      <Node
        className={className}
        wrapper="ListPage"
        props={this.props}
        onScroll={this.handleScroll}
        // @ts-ignore
        domRef={(r) => {
          this._ref = r;
        }}
      >
        <div
          className={`page-inner list-page-inner${split ? ' with-editor' : ''}`}
        >
          <ListToolbar
            model={model}
            onChangeColumns={this.handleColumns}
            onFilters={this.handleFilters}
            onSplit={this.handleSplit}
            filters={filters}
            options={options}
            columns={columns}
            split={split}
          >
            {
              options.title ? options.title : (
                <span>
                  {tr(model.label)} &nbsp;
                  {recordTotal ? <i>{recordTotal}&nbsp;{tr('records')}</i> : <i>{tr('No records')}</i>}
                </span>
              )}
          </ListToolbar>
          {!options.nofilters && <FilterEditorView model={model} value={filters} onChange={this.handleFilters} />}
          <List
            options={options}
            model={model}
            filters={filters}
            sort={sort}
            columns={columns}
            selected={selected}
            onSort={this.handleSort}
            onSelect={this.handleSelect}
            activated={activated}
            onActive={this.handleActive}
          />
          <ListActionBar
            model={model}
            filters={filters}
            sort={sort}
            records={records}
            selected={selected}
          />
        </div>
        <QuickEditor
          model={model}
          hidden={!split}
          selected={selected}
          onCannel={() => this.handleSplit(!split)}
        />
      </Node>
    );
  }
}

export default connect(
  (state: StoreState) => ({
    lists: state.lists, settings: state.settings
  }),
  (dispatch) => bindActionCreators({
    loadMore: listsRedux.loadMore
  }, dispatch)
)(ListPage);
