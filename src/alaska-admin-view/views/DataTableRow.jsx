// @flow

import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from 'alaska-field-checkbox/views/Checkbox';
import Node from './Node';

type Props = {
  columnList: Alaska$view$Field[],
  record: Object,
  active: boolean,
  selected: boolean,
  model: Object,
  onEdit: Function,
  onActive?: Function,
  onSelect?: Function | null,
  onRemove?: Function,
};

export default class DataTableRow extends React.Component<Props> {
  static contextTypes = { views: PropTypes.object };

  handleChange = () => {
    if (this.props.onSelect) {
      this.props.onSelect(this.props.record, !this.props.selected);
    }
  };

  render() {
    const { views } = this.context;
    const {
      record, columnList, model, onEdit, onRemove, onSelect, onActive, selected, active
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
    let rowClassName = active ? 'active' : undefined;
    let el = (
      <Node
        key={record._id}
        tag="tr"
        wrapper="dataTableRow"
        className={rowClassName}
        onClick={active ? null : onActive}
        onDoubleClick={() => onEdit(record)}
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
          <i className="fa fa-edit text-primary icon-btn" onClick={() => onEdit(record)} />
          {onRemove ?
            <span><i className="fa fa-close text-danger icon-btn" onClick={() => onRemove(record)} /></span> : null}
        </td>
      </Node>
    );

    if (active && model.preview) {
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
