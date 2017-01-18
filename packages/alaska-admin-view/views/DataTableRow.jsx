/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-07-16
 * @author Liang <liang@maichong.it>
 */

import React from 'react';
import { IF, ELSE } from 'jsx-plus';
import shallowEqual from '../utils/shallow-equal';

const { object, array, func, bool } = React.PropTypes;

export default class DataTableRow extends React.Component {

  static propTypes = {
    columns: array,
    record: object,
    model: object,
    onEdit: func,
    onSelect: func,
    onRemove: func,
    selected: bool,
  };

  static contextTypes = {
    views: object
  };

  handleChange = () => {
    this.props.onSelect(this.props.record, !this.props.selected);
  };

  render() {
    const { record, columns, model, onEdit, onRemove, onSelect, selected } = this.props;
    const { views } = this.context;
    let selectEl = onSelect ?
      <td onClick={this.handleChange} className="pointer"><input type="checkbox" checked={!!selected}/></td> : null;
    return <tr onDoubleClick={() => onEdit(record)}>
      {selectEl}
      {columns.map(col => {
        let key = col.key;
        let CellViewClass = views[col.field.cell];
        if (!CellViewClass) {
          console.warn('Missing : ' + col.field.cell);
          return <td style={{background:'#fcc'}} key={key}>{record[key]}</td>;
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
        <i className="fa fa-edit" onClick={()=>onEdit(record)}/>
        <IF test={onRemove} tag="span">
          <i className="fa fa-close text-danger" onClick={() => onRemove(record)}/>
        </IF>
      </td>
    </tr>;
  }
}
