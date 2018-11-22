import { createAction, handleActions } from 'redux-actions';
import * as immutable from 'seamless-immutable';
import { ActionState } from 'alaska-admin-view';

export const ACTION_REQUEST = 'ACTION_REQUEST';
export const ACTION_SUCCESS = 'ACTION_SUCCESS';
export const ACTION_FAILURE = 'ACTION_FAILURE';

// 初始state
export const INITIAL_STATE: ActionState = immutable({
  action: '',
  model: '',
  service: '',
  fetching: false,
  errorMsg: ''
});

export const actionRequest = createAction(ACTION_REQUEST);
export const actionSuccess = createAction(ACTION_SUCCESS);
export const actionFailure = createAction(ACTION_FAILURE);

export default handleActions({
  ACTION_REQUEST: (state, action) => {
    const payload: {} = action.payload;
    return state.merge({ fetching: true, errorMsg: '', ...payload });
  },
  ACTION_SUCCESS: (state, action) => {
    const payload: {} = action.payload;
    return state.merge({ fetching: false, errorMsg: '', ...payload });
  },
  ACTION_FAILURE: (state, action) => {
    // @ts-ignore
    const payload: Error = action.payload;
    return state.merge({ errorMsg: payload.message });
  }
}, INITIAL_STATE);
