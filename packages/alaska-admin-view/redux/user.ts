import { createAction, handleActions } from 'redux-actions';
import * as immutable from 'seamless-immutable';
import { UserState } from '..';

export const APPLY_USER = 'APPLY_USER';

// 初始state
const INITIAL_STATE: UserState = immutable({
  id: '',
  displayName: '',
  avatar: ''
});

/**
 * 更新用户信息
 * @params {Object} user
 */
export const applyUser = createAction(APPLY_USER);

export default handleActions({
  APPLY_USER: (state, action) => state.merge(action.payload),
  LOGOUT: () => INITIAL_STATE
}, INITIAL_STATE);
