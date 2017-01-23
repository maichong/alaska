import { handleActions } from 'redux-actions';

export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const REFRESH_INFO_SUCCESS = 'REFRESH_INFO_SUCCESS';

export default handleActions({
  LOGIN_SUCCESS: (state, action) => state.merge(!!action.payload.signed),
  LOGOUT_SUCCESS: (state) => state.merge(false),
  REFRESH_INFO_SUCCESS: (state, action) => state.merge(!!action.payload.signed)
}, false);
