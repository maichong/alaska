import { createAction, handleActions } from 'redux-actions';
import immutable from 'seamless-immutable';

export const UPDATE_USER = 'UPDATE_USER';

// 初始state
export const INITIAL_STATE = immutable({});

/**
 * 更新用户信息
 * @params {Object} user
 */
export const updateUser = createAction(UPDATE_USER);

export default handleActions({
  UPDATE_USER: (state, action) => state.merge(action.payload)
}, INITIAL_STATE);
