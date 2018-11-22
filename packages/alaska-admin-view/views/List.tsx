import * as _ from 'lodash';
import * as React from 'react';
import * as tr from 'grackle';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router-dom';
import Node from './Node';
import DataTable from './DataTable';
import LoadingPage from './LoadingPage';
import { ListProps, Record, State, RecordList } from '..';
import * as listsRedux from '../redux/lists';

interface ListState {
  records?: null | Record[];
  list?: RecordList<any>;
}

interface Props extends ListProps {
  loadList: Function;
  lists: { [model: string]: RecordList<any> };
}

class List extends React.Component<Props, ListState> {
  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    this.init(this.props, null);
  }

  componentWillReceiveProps(nextProps: Props) {
    this.init(nextProps, this.props);
  }

  init = (props: Props, oldProps?: Props) => {
    const { model, lists } = props;
    let nextState: { records?: null | Record[]; list?: RecordList<any> } = {};
    let list = lists[model.id];
    if (list) {
      nextState.records = list.results;
    } else {
      nextState.records = null;
    }
    nextState.list = list;
    this.setState(nextState, () => {
      let { filters, options, sort } = oldProps ? oldProps : props;
      if (
        !nextState.records ||
        !_.isEqual(props.filters, filters) ||
        !_.isEqual(props.options.search, options.search) ||
        !_.isEqual(props.sort, sort)
      ) {
        this.loadRecords();
      }
    });
  }

  loadRecords = () => {
    let { list } = this.state;
    let { filters, options, sort, model, loadList } = this.props;
    if (!model || (list && list.fetching)) return;
    // if (list && (list.page > 1 || !list.next)) return;
    loadList({
      model: model.id,
      page: 1,
      sort: sort,
      filters,
      search: options ? options.search : ''
    });
  };

  renderEmpty() {
    const { model } = this.props;
    let { list } = this.state;
    if (!list || list.fetching) return null;
    return (
      <div className="error-info">
        <div className="error-title">{tr('No data!', model.serviceId)}</div>
        <div className="error-desc">
          {tr('No records found.', model.serviceId)}&nbsp;&nbsp;
          {
            model.nocreate === true ? null : <Link to={`/edit/${model.serviceId}/${model.modelName}/_new`}>
              {tr('Create', model.serviceId)}
            </Link>
          }
        </div>
      </div>
    );
  }

  render() {
    let { records } = this.state;
    const {
      model, sort, columns, selected,
      onSort, onSelect, onActive
    } = this.props;
    if (!records) return <LoadingPage />;
    if (!records.length) return this.renderEmpty();
    return (
      <Node
        className="list"
        wrapper="List"
        props={this.props}
      >
        <DataTable
          model={model}
          sort={sort}
          columns={columns}
          records={records}
          selected={selected}
          onActive={onActive}
          onSort={onSort}
          onSelect={onSelect}
        />
      </Node>
    );
  }
}

export default connect(
  ({ lists }: State) => ({ lists }),
  (dispatch) => bindActionCreators({
    loadList: listsRedux.loadList
  }, dispatch)
)(List);
