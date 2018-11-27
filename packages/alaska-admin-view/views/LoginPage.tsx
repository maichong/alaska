import * as React from 'react';
import { connect } from 'react-redux';
import Node from './Node';
import LoginForm from './LoginForm';
import { LoginPageProps, State } from '..';

interface Props extends LoginPageProps {
  loginLogo: string;
}

class LoginPage extends React.Component<Props> {

  render() {
    const { loginLogo } = this.props;

    return (
      <Node
        className="login-page"
        wrapper="LoginPage"
        props={this.props}
      >
        <div className="login-logo">
          <img alt="" src={loginLogo || 'img/logo_reverse.png'} />
        </div>
        <LoginForm />
      </Node>
    );
  }
}

export default connect(
  ({ settings }: State) => ({ loginLogo: settings.loginLogo })
)(LoginPage);
