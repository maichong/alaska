import * as _ from 'lodash';
import * as React from 'react';
import * as tr from 'grackle';
import { connect } from 'react-redux';
import { ColumnsToolProps, StoreState } from '..';
import Node from './Node';
import ButtonDropdown from 'reactstrap/lib/ButtonDropdown';
import DropdownToggle from 'reactstrap/lib/DropdownToggle';
import DropdownMenu from 'reactstrap/lib/DropdownMenu';
import DropdownItem from 'reactstrap/lib/DropdownItem';
import TooltipWrapper from '@samoyed/tooltip-wrapper';

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
    if (!columns.length) {
      columns = model.defaultColumns;
    }
    if (columns.indexOf(key) > -1) {
      columns = _.without(columns, key);
    } else {
      columns = _.map(model.fields, (field) => {
        if (field.path === key || columns.indexOf(field.path) > -1) {
          return field.path;
        }
        return '';
      }).filter(_.identity);
    }
    onChange(columns);
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
        <DropdownItem
          key={field.path}
          className="with-icon"
          onClick={() => this.handleSelect(field.path)}
        >{icon} {tr(field.label, model.serviceId)}
        </DropdownItem>
      );
    }).filter(_.identity);
    return (
      <Node
        className="cloumns-tool"
        wrapper="CloumnsTool"
        props={this.props}
      >
        <ButtonDropdown
          isOpen={this.state.columnsOpen}
          toggle={() => this.setState({ columnsOpen: !columnsOpen })}
        >
          <TooltipWrapper
            tooltip={tr('Select columns')}
            placement="bottom"
          >
            <DropdownToggle color="light">
              <i className="fa fa-columns" />
            </DropdownToggle>
          </TooltipWrapper>
          <DropdownMenu>
            {items}
          </DropdownMenu>
        </ButtonDropdown>
      </Node>
    );
  }
}
export default connect(
  ({ settings }: StoreState) => ({ superMode: settings.superMode })
)(ColumnsTool);
