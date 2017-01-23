import { handleActions } from 'redux-actions';

export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const REFRESH_INFO_SUCCESS = 'REFRESH_INFO_SUCCESS';

export default handleActions({
  LOGIN_SUCCESS: (state, action) => state.merge(!!action.payload.access),
  LOGOUT_SUCCESS: (state) => state.merge({ show: true }),
  REFRESH_INFO_SUCCESS: (state, action) => state.merge(!!action.payload.access)
}, false);
