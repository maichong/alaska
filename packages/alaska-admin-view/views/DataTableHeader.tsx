import * as React from 'react';
import * as tr from 'grackle';
import { connect } from 'react-redux';
import Checkbox from '@samoyed/checkbox';
import Node from './Node';
import { DataTableHeaderProps, Field, State } from '..';

interface Props extends DataTableHeaderProps {
  superMode: boolean;
  locale: string;
}

interface DataTableHeaderState {
}

class DataTableHeader extends React.Component<Props, DataTableHeaderState> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  handleCheck = () => {
    if (this.props.onSelect) {
      this.props.onSelect();
    }
  }

  render() {
    let { columns, select, sort, model, onSort, onSelect, superMode } = this.props;
    return (
      <Node
        tag="thead"
        wrapper="DataTableHeader"
        props={this.props}
        className="data-table-header"
      >
        <tr>
          {
            onSelect ?
              <th scope="col">
                <Checkbox value={select} onChange={this.handleCheck} />
              </th>
              : null
          }
          {
            columns.map((key: string) => {
              let sortIcon = null;
              let handleClick;
              let field: Field = model.fields[key];
              if (!field || field.hidden || !field.cell) return null;
              if (field.super && !superMode) return null;
              if (field && !field.nosort && onSort) {
                if (field.path === sort) {
                  sortIcon = <i className="fa fa-sort-asc m-l-5" />;
                  handleClick = () => onSort('-' + field.path);
                } else if ('-' + field.path === sort) {
                  sortIcon = <i className="fa fa-sort-desc m-l-5" />;
                  handleClick = () => onSort(field.path);
                } else {
                  handleClick = () => onSort('-' + field.path);
                }
              }
              return (<th
                key={key}
                scope="col"
                onClick={handleClick}
              >
                {tr(field ? field.label : key, model.serviceId)}{sortIcon}
              </th>);
            })
          }
          {
            onSelect ? <th /> : null
          }
        </tr>
      </Node>
    );
  }
}
export default connect(
  ({ settings }: State) => ({ superMode: settings.superMode, locale: settings.locale })
)(DataTableHeader);
