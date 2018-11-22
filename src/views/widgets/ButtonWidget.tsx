import * as React from 'react';
import { WidgetProps } from 'alaska-admin-view';
import ButtonDropdown from 'reactstrap/lib/ButtonDropdown';
import DropdownToggle from 'reactstrap/lib/DropdownToggle';
import DropdownMenu from 'reactstrap/lib/DropdownMenu';
import DropdownItem from 'reactstrap/lib/DropdownItem';

interface TestWidgetState {
  open: boolean;
}

export default class DropdownWidget extends React.Component<WidgetProps, TestWidgetState> {


  render() {

    return (
      <li>
        <button className="btn btn-default">
          <i className="fa fa-cogs" />按钮
        </button>
      </li>

    );
  }
}
