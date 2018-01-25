//@flow

import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import akita from 'akita';
import qs from 'qs';
import random from 'string-random';
import Immutable from 'seamless-immutable';
import type { ImmutableObject, ImmutableArray } from 'seamless-immutable';
import Node from './Node';
import SearchField from './SearchField';
import TopToolbar from './TopToolbar';
import ListActions from './ListActions';
import QuickEditor from './QuickEditor';
import FilterEditor from './FilterEditor';
import FilterTool from './FilterTool';
import ColumnTool from './ColumnTool';
import List from './List';
import ListBottomBar from './ListBottomBar';
import Loading from './Loading';

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

type State = {
  model: Alaska$view$Model | null,
  list: ?Alaska$view$RecordList,
  records: ImmutableArray<Alaska$view$Record>,
  selected: ImmutableArray<Alaska$view$Record>,
  activated: ImmutableObject<Alaska$view$Record> | null,
  query: Object,
  sort: string,
  search: string,
  filters: Object,
  columns: string[]
};

// $Flow
const EMPTY_RECORD_LIST: ImmutableArray<Alaska$view$Record> = Immutable([]);

class ListPage extends React.Component<Props, State> {
  static contextTypes = {
    views: PropTypes.object,
    settings: PropTypes.object,
    t: PropTypes.func,
    confirm: PropTypes.func,
    toast: PropTypes.func,
    router: PropTypes.object,
  };

  _listRef: ?Object;
  _ref: ?Object;

  constructor(props: Props) {
    super(props);
    // $Flow init() 负责初始化state
    this.state = {
      selected: EMPTY_RECORD_LIST,
      activated: null
    };
  }

  componentWillMount() {
    this.init(this.props);
  }

  componentWillReceiveProps(nextProps: Props) {
    this.init(nextProps);
  }

  init(props: Props) {
    const { settings } = this.context;
    const { match, lists } = props;
    const { params } = match;
    let nextState = {};
    let modelId = params.service + '.' + params.model;
    nextState.records = EMPTY_RECORD_LIST;
    let model = settings.models[modelId] || null;
    let list;
    if (model) {
      list = lists[model.key];
      if (list) {
        nextState.records = list.results;
      }
    }

    if (!model || !nextState.records.length) {
      nextState.selected = EMPTY_RECORD_LIST;
      nextState.activated = null;
    }
    let searchString = (props.location.search || '').substr(1);
    let query: Object = qs.parse(searchString) || {};
    nextState.sort = query._sort || '';
    nextState.search = query._search || '';
    nextState.filters = _.reduce(query, (res, v, k) => {
      if (k[0] !== '_' || k === '_id') {
        res[k] = v;
      }
      return res;
    }, {});
    nextState.columns = (query._columns || '').split('-').filter((a) => a);
    nextState.query = query;
    nextState.list = list;
    nextState.model = model;
    ['filters', 'columns'].forEach((key) => {
      if (_.isEqual(nextState[key], this.state[key])) {
        delete nextState[key];
      }
    });
    this.setState(nextState);
  }

  refresh = () => {
    if (this._listRef) {
      let ref = this._listRef.getWrappedInstance();
      if (ref) {
        ref.refresh();
      }
    }
  };

  loadMore() {
    if (this._listRef) {
      let ref = this._listRef.getWrappedInstance();
      if (ref) {
        ref.loadMore();
      }
    }
  }

  updateQuery() {
    let query = {};
    const {
      model, filters, sort, search, columns
    } = this.state;
    if (!model) return;
    if (search) {
      query._search = search;
    }
    if (sort && sort !== model.defaultSort) {
      query._sort = sort;
    }
    if (columns.length && !_.isEqual(columns, model.defaultColumns)) {
      query._columns = columns.join('-');
    }
    query._r = random(3);
    _.assign(query, filters, _.pick(this.state.query, '_nofilters', '_nocolumns'));
    let { pathname } = this.props.location;
    this.context.router.history.replace({ pathname, search: '?' + qs.stringify(query, { encode: false }) });
  }

  handleSort = (sort: string) => {
    this.setState({ sort }, () => {
      this.refresh();
      this.updateQuery();
    });
  };

  handleSearch = (search: string) => {
    this.setState({ search }, () => {
      this.refresh();
      this.updateQuery();
    });
  };

  handleFilters = (filters: Object) => {
    this.setState({ filters }, () => {
      this.refresh();
      this.updateQuery();
    });
  };

  handleColumns = (columns: string[]) => {
    this.setState({ columns }, () => {
      this.refresh();
      this.updateQuery();
    });
  };

  handleScroll = () => {
    const ref = this._ref;
    if (!ref) return;
    if ((ref.scrollHeight - (ref.offsetHeight + ref.scrollTop)) < 50) {
      this.loadMore();
    }
  };

  handleSelect = (selected) => {
    let nextState = { selected };
    if (this.state.activated && !selected.length) {
      // $Flow
      nextState.activated = null;
    } else if (selected.length && !this.state.activated) {
      // $Flow
      nextState.activated = selected[0];
    }
    this.setState(nextState);
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
    let nextState = { activated: record };
    if (!selected.length || (selected.length === 1 && selected[0] !== record)) {
      // $Flow
      nextState.selected = Immutable([record]);
    }
    this.setState(nextState);
  };

  renderToolbar() {
    const { t } = this.context;
    const {
      model, filters, columns, search, list, query
    } = this.state;
    if (!model || !list) return null;
    let tools = [];

    if (!query._nofilters) {
      tools.push(<FilterTool
        key="filters"
        model={model}
        filters={filters}
        onChange={this.handleFilters}
      />);
    }
    if (!query._nocolumns) {
      tools.push(<ColumnTool
        key="columns"
        model={model}
        columns={columns}
        onChange={this.handleColumns}
      />);
    }
    tools.push(<button
      key="refresh"
      className="btn btn-primary"
      onClick={this.refresh}
    >
      <i className="fa fa-refresh" />
    </button>);
    return (
      <TopToolbar tools={tools}>
        {t(model.label || model.modelName, model.serviceId)}
        {search ? <i>  &nbsp; ( {t('Search')} : {search} ) </i> : null}
        &nbsp; <i>{list.total !== undefined ? t('total records', { total: list.total }) : null}</i>
      </TopToolbar>
    );
  }

  render() {
    const { refreshSettings } = this.props;
    const {
      model,
      sort,
      search,
      filters,
      columns,
      records,
      selected,
      activated
    } = this.state;
    if (!model) {
      return <Loading />;
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

    let className = [
      'list-page',
      model.serviceId + '-' + model.id,
      model.canCreate ? 'can-create' : 'no-create',
      model.canUpdate ? 'can-update' : 'no-update',
      model.canRemove ? 'can-remove' : 'no-remove',
    ].join(' ');

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
          <FilterEditor model={model} value={filters} onChange={this.handleFilters} />
          <List
            ref={(r) => {
              this._listRef = r;
            }}
            model={model}
            sort={sort}
            search={search}
            filters={filters}
            onSort={this.handleSort}
            onSelect={this.handleSelect}
            onRemove={handleRemove}
            onActive={this.handleActive}
            selected={selected}
            activated={activated}
            columns={columns}
          />
          <ListBottomBar
            model={model}
            search={search}
            records={records}
            selected={selected}
            onSearch={this.handleSearch}
            onRefresh={this.refresh}
            onRefreshSettings={refreshSettings}
          />
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

export default connect(({ lists }) => ({ lists }), () => ({}))(ListPage);
