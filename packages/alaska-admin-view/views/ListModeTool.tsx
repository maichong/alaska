import * as React from 'react';
import * as tr from 'grackle';
import ButtonDropdown from 'reactstrap/lib/ButtonDropdown';
import DropdownToggle from 'reactstrap/lib/DropdownToggle';
import DropdownMenu from 'reactstrap/lib/DropdownMenu';
import DropdownItem from 'reactstrap/lib/DropdownItem';
import Node from './Node';
import { ToolProps } from '..';

interface ListModeToolState {
  mode: string;
  open: boolean;
}

const options = [{
  label: 'list',
  value: 'list'
}, {
  label: 'card',
  value: 'th-large'
}];

export default class ListModeTool extends React.Component<ToolProps, ListModeToolState> {
  constructor(props: ToolProps) {
    super(props);
    this.state = {
      mode: options[0].value,
      open: false
    };
  }

  render() {
    let { mode, open } = this.state;
    let { page } = this.props;
    if (page === 'editor') return null;

    // TODO:
    return '';

    return (
      <Node
        className="list-mode-tool"
        wrapper="ListModeTool"
        props={this.props}
      >
        <ButtonDropdown
          isOpen={open}
          toggle={() => this.setState({ open: !open })}
        >
          <DropdownToggle caret color="default">
            <i className={`fa fa-${mode}`} />
          </DropdownToggle>
          <DropdownMenu>
            {
              options.map((i) => (
                <DropdownItem
                  key={i.value}
                  onClick={() => this.setState({ mode: i.value })}
                >
                  <i className={`fa fa-${i.value}`} />{tr(i.label)}
                </DropdownItem>
              ))
            }
          </DropdownMenu>
        </ButtonDropdown>
      </Node>
    );
  }
}
