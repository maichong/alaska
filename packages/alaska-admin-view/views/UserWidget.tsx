import * as React from 'react';
import * as tr from 'grackle';
import { WidgetProps, State, User } from '..';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import TooltipWrapper from '@samoyed/tooltip-wrapper';
import ButtonDropdown from 'reactstrap/lib/ButtonDropdown';
import DropdownToggle from 'reactstrap/lib/DropdownToggle';
import DropdownMenu from 'reactstrap/lib/DropdownMenu';
import DropdownItem from 'reactstrap/lib/DropdownItem';
import * as loginRedux from '../redux/login';
import * as refreshRedux from '../redux/refresh';

interface Props extends WidgetProps {
  user: null | User;
  logout: Function;
  refresh: Function;
}

interface UserWidgetState {
  userOpen: boolean;
}

class UserWidget extends React.Component<Props, UserWidgetState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      userOpen: false
    };
  }

  handleRefresh = () => {
    this.props.refresh();
  }

  handleLogout = () => {
    this.props.logout();
  }

  render() {
    let { user } = this.props;
    let { userOpen } = this.state;
    if (!user) {
      return null;
    }
    return (
      <TooltipWrapper
        placement="bottom"
        tooltip={user.displayName || user.username}
      >
        <li className="user-widget">
          <img className="user-avatar" src={user.avatar || 'img/avatar.png'} alt="" />
          <ButtonDropdown
            isOpen={this.state.userOpen}
            toggle={() => this.setState({ userOpen: !userOpen })}
          >
            <DropdownToggle color="default">
              <img src={user.avatar || 'img/avatar.png'} alt="" />
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem onClick={() => this.handleRefresh()}>
                <i className="fa fa-refresh" />
                {tr('Refresh')}
              </DropdownItem>
              <DropdownItem onClick={() => this.handleLogout()}>
                <i className="fa fa-power-off" />
                {tr('Logout')}
              </DropdownItem>
            </DropdownMenu>
          </ButtonDropdown>
        </li >
      </TooltipWrapper >
    );
  }
}

export default connect(
  ({ settings }: State) => ({ user: settings.user }),
  (dispatch) => bindActionCreators({
    logout: loginRedux.logout,
    refresh: refreshRedux.refresh
  }, dispatch)
)(UserWidget);
