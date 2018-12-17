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
  ListPageProps, ListsState, State, Record, Model, Settings,
  Service
} from '..';

interface Props extends ListPageProps {
  settings: Settings;
  lists: ListsState;
  match: {
    params: {
      service: string;
      model: string;
    };
  };
  location: Location;
  loadMore: Function;
}

interface ListPageOptions {
  [key: string]: any;
}

interface ListPageState {
  records: immutable.Immutable<Record[]>;
  recordTotal: number;
  model: Model | null;
  selected: immutable.Immutable<Record[]>;
  options: ListPageOptions;
  sort: string;
  search: string;
  filters: Filters;
  columns: string[];
  split: boolean;
}

class ListPage extends React.Component<Props, ListPageState> {
  static contextTypes = {
    views: PropTypes.object,
    router: PropTypes.object
  };

  context: any;
  _ref?: {
    scrollHeight: number;
    offsetHeight: number;
    scrollTop: number;
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      records: immutable([]),
      recordTotal: 0,
      model: null,
      selected: immutable([]),
      options: {},
      sort: '',
      search: '',
      filters: {},
      columns: [],
      split: false
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
      }
    }

    let searchString = (props.location.search || '').substr(1);
    let query = qs.parse(searchString) || {};
    let columns = (query._columns || '').split('-').filter((a: string) => a);
    if (columns.length <= 0 && nextState.model) {
      columns = nextState.model.defaultColumns || [];
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
      if (k[0] === '_') {
        k = k.substr(1);
        options[k] = v;
        return;
      }
      filters[k] = v;
    });
    nextState.search = options.search || '';
    delete options.search;
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
      model, filters, sort, options, columns, search
    } = this.state;
    if (!model) return;
    if (sort && sort !== model.defaultSort) {
      query._sort = sort;
    }
    if (columns.length && !_.isEqual(columns, model.defaultColumns)) {
      query._columns = columns.join('-');
    }
    let optionsTemp = {};
    if (options && _.size(options)) {
      optionsTemp = _.mapKeys(options, (v, k) => {
        if (k[0] !== '_') {
          k = '_' + k;
          return k;
        }
        return k;
      });
    }
    _.assign(query, filters, optionsTemp);
    if (search) {
      query._search = search;
    }
    let { pathname } = this.props.location;
    this.context.router.history.replace({ pathname, search: '?' + qs.stringify(query, { encode: false }) });
  }

  handleScroll = () => {
    const ref = this._ref;
    if (!ref) return;
    if ((ref.scrollHeight - (ref.offsetHeight + ref.scrollTop)) < 50) {
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

  handleSearch = (search: string) => {
    this.setState({ search }, () => {
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
  };

  handleColumns = (columns: string[]) => {
    this.setState({ columns }, () => {
      this.updateQuery();
    });
  };

  handleSelect = (selected: immutable.Immutable<Record[]>) => {
    this.setState({ selected });
  };

  handleActive = (record: Record) => {
    let { selected } = this.state;
    let nextState = {} as ListPageState;
    if (!selected.length || (selected.length === 1 && selected[0] !== record)) {
      nextState.selected = immutable([record]);
    }
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
      search
    } = this.state;
    if (!model) {
      return <LoadingPage />;
    }
    let className = [
      'list-page',
      model.serviceId + '-' + model.id,
      model.canCreate ? 'can-create' : 'no-create',
      model.canUpdate ? 'can-update' : 'no-update',
      model.canRemove ? 'can-remove' : 'no-remove',
    ].join(' ');
    return (
      <Node
        className={className}
        wrapper="ListPage"
        props={this.props}
      >
        <div
          className={'list-page-inner' + (split ? ' with-editor' : '')}
          onScroll={this.handleScroll}
          ref={(r) => {
            this._ref = r;
          }}
        >
          <ListToolbar
            model={model}
            onChangeColumns={this.handleColumns}
            onFilters={this.handleFilters}
            onSplit={this.handleSplit}
            filters={filters}
            columns={columns}
            split={split}
          >
            {tr(model.label)} &nbsp;
            {recordTotal ? <i>{recordTotal}&nbsp;{tr('records')}</i> : <i>{tr('No records')}</i>}
          </ListToolbar>
          <FilterEditor model={model} value={filters} onChange={this.handleFilters} />
          <List
            options={options}
            model={model}
            filters={filters}
            search={search}
            sort={sort}
            columns={columns}
            selected={selected}
            onSort={this.handleSort}
            onSelect={this.handleSelect}
            onActive={this.handleActive}
          />
          <ListActionBar
            model={model}
            filters={filters}
            search={search}
            sort={sort}
            records={records}
            selected={selected}
            onSearch={this.handleSearch}
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
  (state: State) => ({
    lists: state.lists, settings: state.settings
  }),
  (dispatch) => bindActionCreators({
    loadMore: listsRedux.loadMore
  }, dispatch)
)(ListPage);
