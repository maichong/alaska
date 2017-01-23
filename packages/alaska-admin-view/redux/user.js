import { createAction, handleActions } from 'redux-actions';

export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const REFRESH = 'REFRESH';
export const REFRESH_INFO_SUCCESS = 'REFRESH_INFO_SUCCESS';

export const refreshInfo = createAction(REFRESH);
export const refreshSuccess = createAction(REFRESH_INFO_SUCCESS, (res) => (res));

export default handleActions({
  LOGIN_SUCCESS: (state, action) => state.merge(action.payload.user),
  LOGOUT_SUCCESS: () => ({}),
  REFRESH_INFO_SUCCESS: (state, action) => state.merge(action.payload.user)
}, {});
