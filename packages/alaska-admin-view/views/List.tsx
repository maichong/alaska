import * as _ from 'lodash';
import * as React from 'react';
import * as tr from 'grackle';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router-dom';
import Node from './Node';
import DataTable from './DataTable';
import LoadingPage from './LoadingPage';
import { Filters } from 'alaska-model';
import { ListProps, StoreState, RecordList } from '..';
import * as listsRedux from '../redux/lists';

interface Props extends ListProps {
  loadList: Function;
  list?: RecordList<any>;
}

class List extends React.Component<Props> {
  filters?: Filters;
  search?: string;
  sort?: string;

  componentDidMount() {
    this.loadRecords();
  }

  componentDidUpdate() {
    let { filters, search, sort, list } = this.props;
    if (!list || sort !== this.sort || search !== this.search || !_.isEqual(filters, this.filters)) {
      this.loadRecords();
    }
  }

  loadRecords = () => {
    let { filters, search, sort, model, loadList, list } = this.props;
    if (!model || (list && list.fetching)) return;
    this.filters = filters;
    this.search = search;
    this.sort = sort;
    loadList({
      model: model.id,
      page: 1,
      sort: sort,
      filters,
      search
    });
  };

  renderEmpty() {
    const { model, list } = this.props;
    if (!list || list.fetching) return null;
    return (
      <div className="error-info">
        <div className="error-title">{tr('No records', model.serviceId)}</div>
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
    const {
      model, sort, columns, selected, activated,
      onSort, onSelect, onActive, list
    } = this.props;
    if (!list || (list.fetching && !list.results.length)) return <LoadingPage />;
    if (!list.results.length) return this.renderEmpty();
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
          records={list.results}
          selected={selected}
          activated={activated}
          onActive={onActive}
          onSort={onSort}
          onSelect={onSelect}
        />
      </Node>
    );
  }
}

export default connect(
  ({ lists }: StoreState, props: ListProps) => ({ list: lists[props.model.id] }),
  (dispatch) => bindActionCreators({
    loadList: listsRedux.loadList
  }, dispatch)
)(List);
