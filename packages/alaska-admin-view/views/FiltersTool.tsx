import * as _ from 'lodash';
import * as React from 'react';
import * as tr from 'grackle';
import { connect } from 'react-redux';
import { FiltersToolProps, StoreState } from '..';
import Node from './Node';
import TooltipWrapper from '@samoyed/tooltip-wrapper';
import DropdownType from 'react-bootstrap/Dropdown';

const Dropdown: typeof DropdownType = require('react-bootstrap/Dropdown');

interface Props extends FiltersToolProps {
  superMode: boolean;
}

interface FiltersToolState {
  filtersOpen: boolean;
}

class FiltersTool extends React.Component<Props, FiltersToolState> {

  constructor(props: Props) {
    super(props);
    this.state = {
      filtersOpen: false
    };
  }

  handleSelect = (key: string) => {
    let { filters, onChange } = this.props;
    let data;
    if (typeof (filters) === 'object' && filters.hasOwnProperty(key)) {
      data = _.omit(filters, key);
    } else {
      data = _.assign({ [key]: null }, filters);
    }
    onChange(data);
  };

  render() {
    let { model, filters, superMode } = this.props;
    let { filtersOpen } = this.state;
    if (this.props.page === 'edit') return null;
    let iconEle = <i className="fa fa-check" />;
    let items = _.map(model.fields, (field) => {
      if (field.hidden || !field.cell) return false;
      if (field.super && !superMode) return false;
      let icon = filters.hasOwnProperty(field.path) ? iconEle : null;
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
        className="filters-tool"
        wrapper="FilterTool"
        props={this.props}
      >
        <Dropdown
          show={this.state.filtersOpen}
          onToggle={(isOpen: boolean) => this.setState({ filtersOpen: isOpen })}
        >
          <TooltipWrapper
            tooltip={tr('Filter')}
            placement="bottom"
          >
            <Dropdown.Toggle variant="light" id="filters-tool">
              <i className="fa fa-filter" />
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
)(FiltersTool);
