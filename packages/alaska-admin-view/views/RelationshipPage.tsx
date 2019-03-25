import * as React from 'react';
import * as _ from 'lodash';
import * as immutable from 'seamless-immutable';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import LoadingPage from './LoadingPage';
import List from './List';
import ListActionBar from './ListActionBar';
import * as listsRedux from '../redux/lists';
import {
  ListsState, StoreState, Record, Model, Settings, RelationshipPageProps
} from '..';

interface Props extends RelationshipPageProps {
  settings: Settings;
  lists: ListsState;
  loadMore: Function;
}

interface State {
  records: immutable.Immutable<Record[]>;
  activated: immutable.Immutable<Record> | null;
  model: Model | null;
  selected: immutable.Immutable<Record[]>;
  sort: string;
  filters: any;
}

class RelationshipPage extends React.Component<Props, State> {
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
      model: null,
      selected: immutable([]),
      sort: '',
      filters: {},
    };
  }

  static getDerivedStateFromProps(nextProps: Props, prevState: State): Partial<State> | null {
    const { lists, relationship, record, settings } = nextProps;
    let nextState: Partial<State> = {};
    let filters = {
      [relationship.path]: record.id
    };
    if (!_.isEqual(filters, prevState.filters)) {
      nextState.filters = filters;
    }
    let model = settings.models[relationship.ref];
    if (model !== prevState.model) {
      nextState.model = model;
      nextState.sort = model.defaultSort;
    }

    let list = lists[relationship.ref];
    if (list) {
      nextState.records = list.results;
    }
    return nextState;
  }

  handleScroll = () => {
    const ref = this._ref;
    if (!ref) return;
    if ((ref.scrollHeight - (ref.offsetHeight + ref.scrollTop)) < 200) {
      const { loadMore, lists, relationship } = this.props;

      let list = lists[relationship.ref];
      if (list && list.next && !list.fetching) {
        loadMore({ model: relationship.ref });
      }
    }
  };

  handleSort = (sort: string) => {
    this.setState({ sort });
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
    let nextState = {} as State;
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
      selected,
      records,
      activated
    } = this.state;

    if (!model) {
      return <LoadingPage />;
    }

    return (
      <div>
        <List
          model={model}
          filters={filters}
          sort={sort}
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
    );
  }
}

export default connect(
  ({ lists, settings }: StoreState) => ({ lists, settings }),
  (dispatch) => bindActionCreators({
    loadMore: listsRedux.loadMore
  }, dispatch)
)(RelationshipPage);
