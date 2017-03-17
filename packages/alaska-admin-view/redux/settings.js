import {
  createAction,
  handleActions
} from 'redux-actions';
import immutable from 'seamless-immutable';

export const APPLY_SETTINGS = 'APPLY_SETTINGS';
export const REFRESH_SETTINGS = 'REFRESH_SETTINGS';

// 初始state
export const INITIAL_STATE = immutable({
  locales: {
    all: {}
  }
});

export const applySettings = createAction(APPLY_SETTINGS);
export const refreshSettings = createAction(REFRESH_SETTINGS);

export default handleActions({
  APPLY_SETTINGS: (state, action) => immutable(action.payload)
}, INITIAL_STATE);
