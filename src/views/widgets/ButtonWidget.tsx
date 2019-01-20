import * as React from 'react';
import { WidgetProps } from 'alaska-admin-view';

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
