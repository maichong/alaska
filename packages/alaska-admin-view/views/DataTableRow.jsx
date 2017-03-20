// @flow

import React from 'react';
import { IF, ELSE } from 'jsx-plus';

const { object } = React.PropTypes;

export default class DataTableRow extends React.Component {

  static contextTypes = {
    views: object
  };

  props: {
    columns: Array<any>,
    record: Object,
    model: Object,
    onEdit: Function,
    onSelect?: Function|null,
    onRemove: Function,
    selected: boolean,
  };

  handleChange = () => {
    if (this.props.onSelect) {
      this.props.onSelect(this.props.record, !this.props.selected);
    }
  };

  render() {
    const { record, columns, model, onEdit, onRemove, onSelect, selected } = this.props;
    const { views } = this.context;
    let selectEl = onSelect ?
      <td onClick={this.handleChange} className="pointer"><input type="checkbox" checked={!!selected} /></td> : null;
    return (
      <tr onDoubleClick={() => onEdit(record)}>
        {selectEl}
        {columns.map((col) => {
          let key = col.key;
          let CellViewClass = views[col.field.cell];
          if (!CellViewClass) {
            console.warn('Missing : ' + col.field.cell);
            return <td style={{ background: '#fcc' }} key={key}>{record[key]}</td>;
          }
          return (<td key={key}>
            {React.createElement(CellViewClass, {
              value: record[key],
              model,
              key,
              field: col.field
            })}
          </td>);
        })}
        <td key="_a" className="actions">
          <i className="fa fa-edit" onClick={() => onEdit(record)} />
          <IF test={onRemove} tag="span">
            <i className="fa fa-close text-danger" onClick={() => onRemove(record)} />
          </IF>
        </td>
      </tr>
    );
  }
}
