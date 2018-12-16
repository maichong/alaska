import { createAction, handleActions } from 'redux-actions';
import * as immutable from 'seamless-immutable';
import * as _ from 'lodash';
import { ActionState, ActionRequestPayload } from '..';

export const ACTION_REQUEST = 'ACTION_REQUEST';
export const ACTION_SUCCESS = 'ACTION_SUCCESS';
export const ACTION_FAILURE = 'ACTION_FAILURE';

// 初始state
export const INITIAL_STATE: ActionState = immutable({
  action: '',
  model: '',
  fetching: false,
  request: '',
  error: null,
  records: [],
  search: '',
  sort: '',
  filters: null,
  body: {},
  result: {}
});

export const actionRequest = createAction<ActionRequestPayload>(ACTION_REQUEST);
export const actionSuccess = createAction(ACTION_SUCCESS);
export const actionFailure = createAction(ACTION_FAILURE);

export default handleActions({
  ACTION_REQUEST: (state, action) => {
    const payload: ActionRequestPayload = action.payload;
    return INITIAL_STATE.merge(payload).set('fetching', true);
  },
  ACTION_SUCCESS: (state, action) => {
    const payload: any = action.payload;
    return state.merge({ fetching: false, error: null, result: payload });
  },
  ACTION_FAILURE: (state, action) => {
    // @ts-ignore
    const payload: Error = action.payload;
    return state.merge({ fetching: false, error: payload });
  }
}, INITIAL_STATE);
