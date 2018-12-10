import { createAction, handleActions } from 'redux-actions';
import * as immutable from 'seamless-immutable';
import { LoginPayload, LoginState } from 'alaska-admin-view';

export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';

/**
 * 请求登录 action
 * @params {string} opt.username
 * @params {string} opt.password
 */
export const login = createAction<LoginPayload>(LOGIN);

/**
 * 登录成功 action
 */
export const loginSuccess = createAction(LOGIN_SUCCESS);

/**
 * 登录失败
 * @params {Error} error
 */
export const loginFailure = createAction<Error>(LOGIN_FAILURE);

/**
 * 退出登录 action
 */
export const logout = createAction(LOGOUT);

// 初始state
export const INITIAL_STATE: LoginState = immutable({
  error: null
});

export default handleActions({
  LOGIN: (state) => state.set('error', null),
  LOGIN_FAILURE: (state, action) => {
    // @ts-ignore
    const payload: Error = action.payload;
    return state.merge({ error: payload });
  },
  LOGOUT_SUCCESS: () => INITIAL_STATE,
  LOGIN_SUCCESS: (state) => state.set('error', null),
  LOGOUT: () => INITIAL_STATE
}, INITIAL_STATE);
