import { createAction, handleActions } from 'redux-actions';
import immutable from 'seamless-immutable';

export const APPLY_USER = 'APPLY_USER';

// 初始state
export const INITIAL_STATE = immutable({});

/**
 * 更新用户信息
 * @params {Object} user
 */
export const applyUser = createAction(APPLY_USER);

export default handleActions({
  APPLY_USER: (state, action) => state.merge(action.payload),
  LOGOUT: () => INITIAL_STATE
}, INITIAL_STATE);
