import { createAction, handleActions } from 'redux-actions';

export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const REFRESH_INFO_SUCCESS = 'REFRESH_INFO_SUCCESS';

// 请求登录action
export const login = createAction(LOGIN, (username, password) => ({ username, password }));

// 登录成功
export const loginSuccess = createAction(LOGOUT_SUCCESS, (res) => (res));

// 登录失败
export const loginFailure = createAction(LOGIN_FAILURE, (error) => ({ errorMsg: error.message }));

// 请求退出登录
export const logout = createAction(LOGOUT);

// 退出登录成功
export const logoutSuccess = createAction(LOGOUT_SUCCESS);

export default handleActions({
  LOGIN_FAILURE: (state, action) => state.merge({ errorMsg: action.payload.errorMsg }),
  LOGOUT_SUCCESS: (state) => state.merge({ show: true }),
  REFRESH_INFO_SUCCESS: (state, action) => {
    if (!action.payload.signed) {
      return state.merge({ show: true });
    }
    return state.merge({ show: false });
  }
}, {
  show: true,
  errorMsg: ''
});
