import * as React from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Checkbox from '@samoyed/checkbox';
import Node from './Node';
import { DataTableRowProps, Field, StoreState, views } from '..';

interface Props extends DataTableRowProps {
  superMode: boolean;
}

class DataTableRow extends React.Component<Props> {
  static contextTypes = {
    router: PropTypes.object,
  };

  context: any;

  handleChange = () => {
    let { record, onSelect, selected } = this.props;
    if (onSelect) {
      onSelect(record, !selected);
    }
  }

  handleDoubleClick = () => {
    let { model, record } = this.props;
    this.context.router.history.push(`/edit/${model.serviceId}/${model.modelName}/${record._id}`);
  }

  render() {
    let {
      model, columns, record, selected,
      onActive, onSelect, superMode
    } = this.props;
    return (
      <tr
        className="data-table-row"
        onClick={() => (onActive ? onActive(record) : '')}
        onDoubleClick={() => this.handleDoubleClick()}
      >
        <Node
          tag={false}
          wrapper="DataTableRow"
          props={this.props}
          className="data-table-row"
        >
          {
            onSelect ?
              <td onClick={(e: any) => e.stopPropagation()}>
                <Checkbox value={selected} onChange={this.handleChange} />
              </td>
              : null
          }
          {
            columns.map((key: string) => {
              let field: Field = model.fields[key];
              if (!field || field.hidden === true || !field.cell) return null;
              if (field.super && !superMode) return null;
              let Cell = views.components[field.cell];
              return <td key={key}>
                {
                  Cell ?
                    <Cell model={model} field={field} value={record[key]} />
                    : (record[key] || '').toString()
                }
              </td>;
            })
          }
          {
            onSelect ?
              <td className="actions">
                <i className="fa fa-eye text-primary" />
              </td>
              : null
          }
        </Node>

      </tr>
    );
  }
}
export default connect(
  ({ settings }: StoreState) => ({ superMode: settings.superMode })
)(DataTableRow);
