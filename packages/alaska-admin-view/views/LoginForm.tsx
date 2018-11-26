import * as React from 'react';
import * as tr from 'grackle';
import * as loginRedux from '../redux/login';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Node from './Node';
import { LoginFormProps, State, LoginState } from '..';

interface LoginFormState {
  username: string;
  password: string;
  errorMsg: string;
  usernameError: string;
  passwordError: string;
}

interface Props extends LoginFormProps {
  login: LoginState;
  // settings: Settings;
  loginAction: Function;
}

class LoginForm extends React.Component<Props, LoginFormState> {
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
    if (nextProps.login.errorMsg) {
      newState.errorMsg = nextProps.login.errorMsg;
    }
    this.setState(newState);
  }

  handleUsername = (e: any) => {
    this.setState({ username: e.target.value });
  };

  handlePassword = (e: any) => {
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
      state.usernameError = ' is-invalid';
    }
    if (!password) {
      state.passwordError = ' is-invalid';
    }
    this.setState(state);
    if (username && password) {
      this.props.loginAction({ username, password });
    }
  };

  handleKeyPress = (e: any) => {
    if (e.key === 'Enter') {
      this.handleLogin();
    }
  };

  render() {
    let state = this.state;
    return (
      <Node className="login-form" wrapper="LoginForm" props={this.props}>
        <div className="login-fileds">
          <div className={'input-group mb-3' + state.usernameError}>
            <div className="input-group-prepend">
              <div className="input-group-text">
                <i className="fa fa-user" />
              </div>
            </div>
            <input
              type="text"
              className="form-control"
              placeholder={tr('Username')}
              onChange={this.handleUsername}
              value={state.username}
            />
          </div>
          <div className={'input-group mb-3' + state.passwordError}>
            <div className="input-group-prepend">
              <div className="input-group-text">
                <i className="fa fa-key" />
              </div>
            </div>
            <input
              type="password"
              className="form-control"
              placeholder={tr('Password')}
              onChange={this.handlePassword}
              value={state.password}
              onKeyPress={this.handleKeyPress}
            />
          </div>

        </div>
        <div
          className="btn btn-primary btn-block login-btn"
          onClick={this.handleLogin}
        >{tr('Login')}</div>
        {state.errorMsg
          ? <div className="login-error">{state.errorMsg}</div>
          : null
        }
      </Node>
    );
  }
}

export default connect(
  ({ login }: State) => ({ login }),
  (dispatch) => bindActionCreators({ loginAction: loginRedux.login }, dispatch)
)(LoginForm);
