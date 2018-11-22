import * as React from 'react';
import { WidgetProps } from 'alaska-admin-view';
// import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import ButtonDropdown from 'reactstrap/lib/ButtonDropdown';
import DropdownToggle from 'reactstrap/lib/DropdownToggle';
import DropdownMenu from 'reactstrap/lib/DropdownMenu';
import DropdownItem from 'reactstrap/lib/DropdownItem';

interface TestWidgetState {
  open: boolean;
}

export default class DropdownWidget extends React.Component<WidgetProps, TestWidgetState> {
  constructor(props: WidgetProps) {
    super(props);
    this.state = {
      open: false
    };
  }

  render() {
    const { open } = this.state;
    return (
      <li>
        <ButtonDropdown isOpen={open} toggle={() => this.setState({ open: !open })}>
          <DropdownToggle caret>
            Button Dropdown
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem>Action</DropdownItem>
            <DropdownItem divider />
            <DropdownItem>Another Action</DropdownItem>
          </DropdownMenu>
        </ButtonDropdown>
      </li>
    );
  }
}
