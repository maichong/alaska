// @flow

import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from 'alaska-field-checkbox/views/Checkbox';
import { DragSource, DropTarget } from 'react-dnd';
import type { Props } from 'alaska-admin-view/views/DataTableRow';
import Node from './Node';

type FinalProps = Props & {
  connectDragSource?: Function,
  connectDropTarget?: Function,
  isDragging?: boolean
};

const source = {
  beginDrag(props) {
    //开始拖动
    let { record } = props;
    props.onDrag(record);
    return { record };
  },
  endDrag(props) {
    props.onDrop();
  }
};

const target = {
  hover(props) {
    props.onHover(props.record);
  }
};

export default class DataTableRow extends React.Component<FinalProps> {
  static contextTypes = {
    views: PropTypes.object,
    settings: PropTypes.object
  };

  handleChange = (e: Object) => {
    e.stopPropagation();
    if (this.props.onSelect) {
      this.props.onSelect(this.props.record, !this.props.selected);
    }
  };

  render() {
    const { views } = this.context;
    const {
      record, columnList, model, onEdit, onRemove, onSelect, onActive, selected, active,
      connectDragSource, connectDropTarget, isDragging
    } = this.props;
    let cellClassName = model.id + '-';
    let selectEl = onSelect ?
      <Node
        tag="th"
        props={{ model, record, selected }}
        wrapper="dataTableRowSelect"
        onClick={this.handleChange}
        className="pointer"
      >
        <Checkbox value={!!selected} />
      </Node> : null;

    let rowClassName = _.filter([
      isDragging ? 'dragging' : '',
      active ? 'active' : '',
      connectDropTarget ? 'can-drag' : 'no-drag',
      model.canUpdateRecord(record) ? 'can-update' : 'no-update',
      model.canRemoveRecord(record) ? 'can-remove' : 'no-remove',
    ]).join(' ');

    let el = (
      <tr
        key={record._id}
        className={rowClassName}
        onClick={active ? null : onActive}
        onDoubleClick={() => onEdit(record)}
      >
        <Node
          tag={false}
          wrapper="dataTableRow"
        >
          {selectEl}
          {columnList.map((field) => {
            let key = field.path;
            let CellViewClass = views[field.cell];
            if (!CellViewClass) {
              console.warn('Missing : ' + field.cell);
              return <td style={{ background: '#fcc' }} key={key}>{record[key]}</td>;
            }
            return (<td key={key} className={cellClassName + key + '-cell'}>
              {React.createElement(CellViewClass, {
                value: record[key],
                model,
                key,
                field
              })}
            </td>);
          })}
          <td key="_a" className="actions">
            <i
              className="fa fa-eye text-primary icon-btn"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(record);
              }}
            />
            <i
              className="fa fa-edit text-primary icon-btn"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(record);
              }}
            />
            {onRemove ?
              <span><i
                className="fa fa-close text-danger icon-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(record);
                }}
              /></span> : null}
          </td>
        </Node>
      </tr>
    );

    if (connectDragSource && connectDropTarget) {
      el = connectDragSource(connectDropTarget(el));
    }

    if (active && model.preview && !isDragging) {
      let View = views[model.preview];
      if (View) {
        let preivew = (
          <tr key={record._id + '-preivew'} className="preview-line">
            <td colSpan={columnList.length + (onSelect ? 2 : 1)}>
              <View
                model={model}
                columnList={columnList}
                record={record}
                selected={selected}
              />
            </td>
          </tr>
        );
        return [el, preivew];
      }
      console.warn('Missing : ' + model.preview);
    }

    return el;
  }
}

const Dropable = DropTarget('TABLE_ROW', target, (connectFun) => ({
  connectDropTarget: connectFun.dropTarget(),
}))(DataTableRow);

export const DataTableRowDragable = DragSource('TABLE_ROW', source, (connectFun, monitor) => ({
  connectDragSource: connectFun.dragSource(),
  isDragging: monitor.isDragging(),
}))(Dropable);
