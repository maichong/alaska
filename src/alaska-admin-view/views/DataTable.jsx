// @flow

import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import shallowEqualWithout from 'shallow-equal-without';
import Checkbox from 'alaska-field-checkbox/views/Checkbox';
import Immutable from 'seamless-immutable';
import type { ImmutableObject, ImmutableArray } from 'seamless-immutable';
import DataTableRow, { DataTableRowDragable } from './DataTableRow';
import Node from './Node';
import store from '../redux';
import * as saveRedux from '../redux/save';
import parseAbility from '../utils/parse-ability';

type Props = {
  model: Alaska$view$Model,
  columns?: string[],
  selected?: ImmutableArray<Alaska$view$Record>,
  records: ImmutableArray<Alaska$view$Record>,
  activated?: ImmutableObject<Alaska$view$Record>,
  sort?: string,
  onSort?: Function,
  onActive?: Function,
  onSelect?: Function,
  onRemove?: Function,
  canDrag?: boolean
};

type State = {
  columnList: Alaska$view$Field[],
  dragging: Alaska$view$Record | null,
  list: ImmutableArray<Alaska$view$Record> | null,
  selectedIdMap: {},
  canDrag: boolean
};

export default class DataTable extends React.Component<Props, State> {
  static contextTypes = {
    router: PropTypes.object,
    settings: PropTypes.object,
    views: PropTypes.object,
    t: PropTypes.func
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedIdMap: {},
      columnList: [],
      list: null,
      dragging: null,
      canDrag: false
    };
  }

  componentDidMount() {
    this.init(this.props);
  }

  componentWillReceiveProps(nextProps: Props) {
    this.init(nextProps);
  }

  shouldComponentUpdate(nextProps: Props, state: State) {
    if (!state.columnList) {
      return false;
    }
    return !shallowEqualWithout(state, this.state) || nextProps.records !== this.props.records;
  }

  init(newProps: Props) {
    let model = newProps.model;
    if (!model) return;
    const { settings } = this.context;

    let newState = {};
    if (newProps.selected) {
      newState.selectedIdMap = _.reduce(newProps.selected, (res, record) => {
        res[record._id] = true;
        return res;
      }, {});
    }

    let columnList = [];
    _.forEach(newProps.columns || model.defaultColumns, (key) => {
      let field = model.fields[key];
      if (field) {
        if (!settings.superMode && field.super) return;
        columnList.push(field);
      }
    });
    newState.columnList = columnList;
    if (newProps.records !== this.props.records) {
      newState.list = null;
      newState.dragging = null;
    }

    function canDrag(): boolean {
      if (!newProps.canDrag) return false;
      if (!model.defaultSort || model.noupdate) return false;
      let sort = model.defaultSort.split(' ')[0];
      if (sort[0] === '-') {
        sort = sort.substr(1);
      }
      let field = model.fields[sort];
      if (!field || field.plain !== 'number') return false;
      let ability = _.get(model, 'actions.update.ability');
      if (ability) {
        if (!settings.abilities[ability]) return false;
      } else if (!model.abilities.update) return false;
      if (field.ability && !settings.abilities[field.ability]) return false;
      return true;
    }

    newState.canDrag = canDrag();
    this.setState(newState);
  }

  isAllSelected() {
    const { records } = this.props;
    const { selectedIdMap } = this.state;
    if (!records || !records.length) {
      return false;
    }
    for (let record of records) {
      if (!selectedIdMap[record._id]) return false;
    }
    return true;
  }

  canCreate = (): boolean => {
    const { model } = this.props;
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
    const { model } = this.props;
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
    const { model } = this.props;
    const { settings } = this.context;
    if (!model || model.noremove) return false;
    let ability = _.get(model, 'actions.remove.ability');
    if (ability) {
      ability = parseAbility(ability);
      if (ability && !settings.abilities[ability]) return false;
    } else if (!model.abilities.remove) return false;
    return true;
  };

  handleDrag = (record: Alaska$view$Record) => {
    this.setState({ dragging: record });
  };

  handleHover = (current: Alaska$view$Record) => {
    const { records } = this.props;
    const { dragging } = this.state;
    if (!dragging || records.length < 2) return;
    if (dragging === current) return;
    let list = this.state.list || records;
    let draggingIndex = list.indexOf(dragging);
    let hoverIndex = list.indexOf(current);
    if (draggingIndex < 0 || hoverIndex < 0) return;
    let newList = records.flatMap((record) => {
      if (record === dragging) {
        return [];
      }
      if (record === current) {
        if (draggingIndex > hoverIndex) {
          return [dragging, current];
        }
        return [current, dragging];
      }
      return [record];
    });
    this.setState({ list: newList });
  };

  handleDrop = () => {
    const { dragging, list } = this.state;
    if (!dragging || !list) return;
    this.setState({ dragging: null, list: null });
    const { model, records } = this.props;
    let oldIndex = records.indexOf(dragging);
    let newIndex = list.indexOf(dragging);
    if (oldIndex === newIndex) return;
    let asc = true;
    let sortField = model.defaultSort.split(' ')[0];
    if (sortField[0] === '-') {
      asc = false;
      sortField = sortField.substr(1);
    }

    function toFixed(value) {
      return parseFloat(value.toFixed(8));
    }

    function getSmallerSortValue(v: number = 0, current: number = 0) {
      v = Math.min(v, current);
      if (v > 2) {
        return toFixed(v / 2);
      }
      return v - 100000000;
    }

    function getBiggerSortValue(v: number = 0, current: number = 0) {
      v = Math.max(v, current);
      return v + 100000000;
    }

    let sort = dragging[sortField] || 0;

    if (newIndex === records.length - 1) {
      // 被拖到了最后
      let last = records[newIndex];
      let sortValue = last[sortField];
      if (asc) {
        sort = getBiggerSortValue(sortValue, sort);
      } else {
        sort = getSmallerSortValue(sortValue, sort);
      }
    } else if (newIndex === 0) {
      let sortValue = records[0][sortField];
      // 被拖到了第一位
      if (asc) {
        sort = getSmallerSortValue(sortValue, sort);
      } else {
        sort = getBiggerSortValue(sortValue, sort);
      }
    } else {
      // 在中间
      let before = list[newIndex - 1][sortField] || 0;
      let after = list[newIndex + 1][sortField] || 0;
      if (before === after) {
        sort = before;
      } else {
        sort = toFixed((after - before) / 2) + before;
        let intSort = parseInt(sort);
        if (
          (before < after && before < intSort && intSort < after)
          || (before > intSort && intSort > after)
        ) {
          sort = intSort;
        }
      }
    }

    let data = {};
    data.id = dragging._id;
    data[sortField] = sort;

    store.dispatch(saveRedux.save({
      service: model.serviceId,
      model: model.modelName,
      key: model.key,
      _: Math.random(),
      sort: model.defaultSort
    }, data));
  };

  handleSelectAll = () => {
    const { onSelect, records } = this.props;
    if (!onSelect) return;
    if (this.isAllSelected()) {
      onSelect(Immutable([]));
    } else {
      onSelect(records);
    }
  };

  handleSelect = (record: Object, isSelected: boolean) => {
    let selectedIdMap = _.clone(this.state.selectedIdMap);
    if (isSelected) {
      selectedIdMap[record._id] = true;
    } else {
      delete selectedIdMap[record._id];
    }
    this.setState({ selectedIdMap });
    let records = Immutable(_.filter(this.props.records, (r) => selectedIdMap[r._id]));
    if (this.props.onSelect) {
      this.props.onSelect(records);
    }
  };

  handleEdit = (record: Object) => {
    const { model } = this.props;
    const { history } = this.context.router;
    let url = '/edit/' + model.serviceId + '/' + model.modelName + '/' + encodeURIComponent(record._id);
    history.push(url);
  };

  render() {
    const {
      model, records, activated, selected, sort, onSort, onSelect, onRemove, onActive
    } = this.props;
    const { t } = this.context;
    const {
      columnList, selectedIdMap, dragging, canDrag
    } = this.state;
    if (!model || !columnList) {
      return <div className="loading">Loading...</div>;
    }

    let list = this.state.list || records;

    let className = 'data-table table table-hover ' + model.serviceId + '-' + model.id + '-record';
    if (canDrag) {
      className += ' can-drag';
      if (dragging) {
        className += ' dragging';
      }
    }
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

    let Row = DataTableRow;
    if (canDrag) {
      Row = DataTableRowDragable;
    }

    let selectEl = onSelect ?
      <Node
        tag="th"
        wrapper="dataTableSelect"
        props={{
          model, records, selected, selectedIdMap
        }}
        onClick={this.handleSelectAll}
        width="29"
      >
        <Checkbox value={this.isAllSelected()} />
      </Node> : null;
    return (
      <Node tag="table" wrapper="dataTable" className={className}>
        <thead>
          <Node
            wrapper="dataTableHeader"
            tag="tr"
            props={{
              model, records, selected, selectedIdMap
            }}
          >
            {selectEl}
            {
              columnList.map((field) => {
                let sortIcon = null;
                let handleClick;
                if (!field.nosort && onSort) {
                  if (field.path === sort) {
                    sortIcon = <i className="fa fa-sort-asc" />;
                    handleClick = () => onSort('-' + field.path);
                  } else if ('-' + field.path === sort) {
                    sortIcon = <i className="fa fa-sort-desc" />;
                    handleClick = () => onSort(field.path);
                  } else {
                    handleClick = () => onSort('-' + field.path);
                  }
                }
                return (<th
                  key={field.path}
                  onClick={handleClick}
                >{t(field.label, model.serviceId)}{sortIcon}
                </th>);
              })
            }
            <th />
          </Node>
        </thead>
        <tbody>
          {
            // $Flow react-dnd 中 connectDragSource等参数可选
            _.map(list, (record: Alaska$view$Record, index: number) => (<Row
              key={record._id || index}
              record={record}
              active={activated === record}
              selected={selectedIdMap[record._id] || false}
              columnList={columnList}
              model={model}
              onEdit={this.handleEdit}
              onSelect={onSelect ? this.handleSelect : null}
              onActive={onActive ? () => onActive(record) : undefined}
              onRemove={onRemove}
              onDrag={this.handleDrag}
              onHover={this.handleHover}
              onDrop={this.handleDrop}
            />))
          }
        </tbody>
      </Node>
    );
  }
}
