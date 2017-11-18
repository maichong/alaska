// @flow

import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as loginRedux from '../redux/login';
import Node from './Node';

type Props = {
  login: Alaska$view$Login,
  loginAction: Function
};

type State = {
  username: string,
  password: string,
  errorMsg: string,
  usernameError: string,
  passwordError: string
};

class Login extends React.Component<Props, State> {
  static contextTypes = {
    actions: PropTypes.object,
    settings: PropTypes.object,
    t: PropTypes.func,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      errorMsg: '',
      usernameError: '',
      passwordError: ''
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    let newState = { errorMsg: '' };
    if (nextProps.login && nextProps.login.errorMsg) {
      newState.errorMsg = nextProps.login.errorMsg;
    }
    this.setState(newState);
  }

  handleUsername = (e: SyntheticInputEvent<*>) => {
    this.setState({ username: e.target.value });
  };

  handlePassword = (e: SyntheticInputEvent<*>) => {
    this.setState({ password: e.target.value });
  };

  handleLogin = () => {
    let { username, password } = this.state;
    let state = {
      errorMsg: '',
      usernameError: '',
      passwordError: ''
    };
    if (!username) {
      state.usernameError = ' has-error';
    }
    if (!password) {
      state.passwordError = ' has-error';
    }
    this.setState(state);
    if (username && password) {
      this.props.loginAction(username, password);
    }
  };

  handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      this.handleLogin();
    }
  };

  render() {
    let state = this.state;
    const { t } = this.context;
    const loginLogo = this.context.settings.loginLogo;

    return (
      <Node id="login" className="panel">
        <Node id="loginLogo"><img alt="" src={loginLogo || 'static/img/logo_reverse.png'} /> </Node>
        <Node id="loginForm" tag="form">
          <Node id="loginField">
            <div className={'form-group' + state.usernameError}>
              <div className="input-group">
                <div className="input-group-addon"><i className="fa fa-user" /></div>
                <input
                  type="text"
                  className="form-control"
                  placeholder={t('Username')}
                  onChange={this.handleUsername}
                  value={state.username}
                />
              </div>
            </div>
            <div className={'form-group' + state.passwordError}>
              <div className="input-group">
                <div className="input-group-addon"><i className="fa fa-key" /></div>
                <input
                  type="password"
                  className="form-control"
                  placeholder={t('Password')}
                  onChange={this.handlePassword}
                  value={state.password}
                  onKeyPress={this.handleKeyPress}
                />
              </div>
            </div>
          </Node>

          <Node
            id="loginButton"
            className="btn btn-primary btn-block"
            onClick={this.handleLogin}
          >{t('Login')}
          </Node>
          {state.errorMsg ? <Node id="loginError" className="label label-danger">{state.errorMsg}</Node> : null}
        </Node>
      </Node>
    );
  }
}

export default connect(
  ({ login }) => ({ login }),
  (dispatch) => bindActionCreators({
    loginAction: loginRedux.login
  }, dispatch)
)(Login);
