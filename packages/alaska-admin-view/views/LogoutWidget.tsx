import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { WidgetProps, StoreState, User } from '..';
import * as loginRedux from '../redux/login';

interface Props extends WidgetProps {
  logout: Function;
  user: null | User;
}

class LogoutWidget extends React.Component<Props> {
  handleLogout = () => {
    this.props.logout();
  }

  render() {
    let { user } = this.props;
    if (!user) {
      return null;
    }
    return (
      <li className="logout-widget">
        <button className="btn" onClick={() => this.handleLogout()}>
          <i className="fa fa-power-off" />
        </button>
      </li>
    );
  }
}

export default connect(
  ({ settings }: StoreState) => ({ user: settings.user }),
  (dispatch) => bindActionCreators({
    logout: loginRedux.logout
  }, dispatch)
)(LogoutWidget);
