import { createAction, handleActions } from 'redux-actions';
import immutable from 'seamless-immutable';

export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';

/**
 * 请求登录 action
 * @params {string} username
 * @params {string} password
 */
export const login = createAction(LOGIN, (username, password) => ({ username, password }));

/**
 * 登录成功 action
 */
export const loginSuccess = createAction(LOGIN_SUCCESS);

/**
 * 登录失败
 * @params {Error} error
 */
export const loginFailure = createAction(LOGIN_FAILURE);

/**
 * 退出登录 action
 */
export const logout = createAction(LOGOUT);

// 初始state
export const INITIAL_STATE = immutable({
  show: true,
  errorMsg: ''
});

export default handleActions({
  LOGIN_FAILURE: (state, { payload }) => state.merge({ errorMsg: payload.message }),
  LOGOUT_SUCCESS: () => INITIAL_STATE,
  LOGIN_SUCCESS: (state, action) => state.merge({ user: false, errorMsg: '' })
}, INITIAL_STATE);
