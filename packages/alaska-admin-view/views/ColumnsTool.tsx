import * as _ from 'lodash';
import * as React from 'react';
import * as tr from 'grackle';
import { connect } from 'react-redux';
import { ColumnsToolProps, StoreState } from '..';
import Node from './Node';
import TooltipWrapper from '@samoyed/tooltip-wrapper';
import DropdownType from 'react-bootstrap/Dropdown';

const Dropdown: typeof DropdownType = require('react-bootstrap/Dropdown');

interface Props extends ColumnsToolProps {
  superMode: boolean;
}

interface ColumnsToolState {
  columnsOpen: boolean;
}

class ColumnsTool extends React.Component<Props, ColumnsToolState> {

  constructor(props: Props) {
    super(props);
    this.state = {
      columnsOpen: false
    };
  }

  handleSelect = (key: string) => {
    let { model, columns, onChange } = this.props;
    if (!columns) {
      columns = model.defaultColumns;
    }
    let array = columns.split(' ');
    if (array.indexOf(key) > -1) {
      array = _.without(array, key);
    } else {
      array = _.map(model.fields, (field) => {
        if (field.path === key || array.indexOf(field.path) > -1) {
          return field.path;
        }
        return '';
      }).filter(_.identity);
    }
    onChange(array.join(' '));
  };

  render() {
    let { model, columns, superMode } = this.props;
    let { columnsOpen } = this.state;
    let iconEle = <i className="fa fa-check" />;
    if (!columns.length) {
      columns = model.defaultColumns;
    }
    let items = _.map(model.fields, (field) => {
      if (field.hidden === true || !field.cell) return false;
      if (field.super && !superMode) return false;
      let icon = columns.indexOf(field.path) > -1 ? iconEle : null;
      return (
        <Dropdown.Item
          key={field.path}
          className="with-icon"
          onClick={() => this.handleSelect(field.path)}
        >{icon} {tr(field.label, model.serviceId)}
        </Dropdown.Item>
      );
    }).filter(_.identity);
    return (
      <Node
        className="cloumns-tool"
        wrapper="CloumnsTool"
        props={this.props}
      >
        <Dropdown
          show={columnsOpen}
          onToggle={(isOpen: boolean) => this.setState({ columnsOpen: isOpen })}
        >
          <TooltipWrapper
            tooltip={tr('Select columns')}
            placement="bottom"
          >
            <Dropdown.Toggle variant="light" id="cloumns-tool">
              <i className="fa fa-columns" />
            </Dropdown.Toggle>
          </TooltipWrapper>
          <Dropdown.Menu>
            {items}
          </Dropdown.Menu>
        </Dropdown>
      </Node>
    );
  }
}
export default connect(
  ({ settings }: StoreState) => ({ superMode: settings.superMode })
)(ColumnsTool);
