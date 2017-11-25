import {
  createAction,
  handleActions
} from 'redux-actions';

export const APPLY_SETTINGS = 'APPLY_SETTINGS';
export const REFRESH_SETTINGS = 'REFRESH_SETTINGS';

// 初始state
export const INITIAL_STATE = {
  locales: {
    all: {}
  }
};

export const applySettings = createAction(APPLY_SETTINGS);
export const refreshSettings = createAction(REFRESH_SETTINGS);

export default handleActions({
  APPLY_SETTINGS: (state, action) => action.payload,
  LOGOUT: () => INITIAL_STATE
}, INITIAL_STATE);
