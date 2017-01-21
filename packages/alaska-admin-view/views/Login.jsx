// @flow

import React from 'react';

import { IF } from 'jsx-plus';
import { connect } from 'react-redux';
import * as actions from '../actions';
import Node from './Node';


const { func, object } = React.PropTypes;

class Login extends React.Component {
  static propTypes = {
    login: object
  };

  static contextTypes = {
    actions: object,
    settings: object,
    t: func,
  };

  state:Object;

  constructor(props:Object) {
    super(props);
    this.state = {
      username: '',
      password: '',
      usernameError: '',
      passwordError: ''
    };
  }

  componentWillReceiveProps(nextProps:Object) {
    let newState = {};
    if (nextProps.login && nextProps.login.errorMsg) {
      newState.errorMsg = nextProps.login.errorMsg;
    }
    this.setState(newState);
  }

  handleUsername = (e:Object) => {
    this.setState({ username: e.target.value });
  };

  handlePassword = (e:Object) => {
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
      this.context.actions.login({ username, password });
    }
  };

  handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      this.handleLogin();
    }
  };

  render() {
    let state = this.state;
    const t = this.context.t;
    const logoReverse = this.context.settings.logoReverse;

    return (
      <Node id="login" className="panel">
        <Node id="loginLogo"><img src={logoReverse || 'static/img/logo_reverse.png'}/> </Node>
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
            id="loginButton" className="btn btn-primary btn-block"
            onClick={this.handleLogin}
          >{t('Login')}</Node>

          <IF test={state.errorMsg}>
            <Node id="loginError" className="label label-danger">{state.errorMsg}</Node>
          </IF>
        </Node>
      </Node>
    );
  }
}

export default connect(({ login }) => ({ login }))(Login);
