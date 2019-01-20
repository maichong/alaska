import * as React from 'react';
import { WidgetProps, StoreState, User } from '..';
import { connect } from 'react-redux';
import TooltipWrapper from '@samoyed/tooltip-wrapper';

interface Props extends WidgetProps {
  user: null | User;
}

class UserWidget extends React.Component<Props> {
  render() {
    let { user } = this.props;
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
        </li >
      </TooltipWrapper >
    );
  }
}

export default connect(
  ({ settings }: StoreState) => ({ user: settings.user })
)(UserWidget);
