import * as _ from 'lodash';
import * as immutable from 'seamless-immutable';
import * as React from 'react';
import Node from './Node';
import DataTableHeader from './DataTableHeader';
import DataTableRow from './DataTableRow';
import { DataTableProps, Record } from '..';

interface DataTableState {
  selectAll: boolean;
  selectList: string[];
}

export default class DataTable extends React.Component<DataTableProps, DataTableState> {
  constructor(props: DataTableProps) {
    super(props);
    this.state = immutable({
      selectAll: false,
      selectList: []
    });
  }

  componentWillReceiveProps(nextProps: DataTableProps) {
    let { selected, records } = nextProps;
    if (_.isEqual(this.props.selected, selected) || _.isEqual(this.props.records, records)) {
      let selectList = [];
      selectList = _.map(selected, (item) => String(item._id));
      this.setState(immutable({
        selectList,
        selectAll: selectList.length > 0 && selectList.length === records.length
      }));
    }
  }

  handleSelectAll = () => {
    const { selectAll } = this.state;
    const { records, onSelect } = this.props;
    if (!onSelect) return;
    let select: Record[] = [];
    if (!selectAll) {
      select = records;
    }
    onSelect(select);
  }

  handleSelect = (record: Record, select: boolean) => {
    let { selected, onSelect } = this.props;
    if (!onSelect) return;
    selected = selected || [];
    let tmpSelect: Record[] = [];
    let lookup = false;
    _.forEach(selected, (item: Record) => {
      if (String(item._id) !== String(record._id)) {
        tmpSelect.push(item);
      } else {
        lookup = true;
      }
    });
    if (!lookup && select) {
      tmpSelect.push(record);
    }
    onSelect(tmpSelect);
  };

  render() {
    let {
      model, columns, records,
      sort, onSort, onActive, onSelect
    } = this.props;
    let { selectAll, selectList } = this.state;
    columns = columns || model.defaultColumns || [];
    if (!columns || !columns.length) {
      columns = Object.keys(model.fields);
    }
    return (
      <Node
        tag="table"
        wrapper="DataTable"
        props={this.props}
        className="data-table table"
      >
        <DataTableHeader
          model={model}
          columns={columns}
          select={selectAll}
          sort={sort}
          onSelect={onSelect ? this.handleSelectAll : null}
          onSort={onSort}
        />
        <tbody>
          {
            records.map((item) => (<DataTableRow
              key={item._id}
              model={model}
              columns={columns}
              record={item}
              selected={selectAll || selectList.indexOf(String(item._id)) > -1}
              onSelect={onSelect ? this.handleSelect : null}
              onActive={onActive}
            />))
          }
        </tbody>
      </Node>
    );
  }
}
