import * as React from 'react';
import { WidgetProps } from 'alaska-admin-view';
import DropdownType from 'react-bootstrap/Dropdown';

const Dropdown: typeof DropdownType = require('react-bootstrap/Dropdown');

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
        <Dropdown show={open} onToggle={(isOpen: boolean) => this.setState({ open: isOpen })}>
          <Dropdown.Toggle id="drapdown-widget">
            Button Dropdown
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item>Action</Dropdown.Item>
            <Dropdown.Item divider />
            <Dropdown.Item>Another Action</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </li>
    );
  }
}
