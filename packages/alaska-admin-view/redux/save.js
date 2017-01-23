import { createAction, handleActions } from 'redux-actions';

export const SAVE = 'SAVE';
export const SAVE_SUCCESS = 'SAVE_SUCCESS';
export const SAVE_FAILURE = 'SAVE_FAILURE';
export const REMOVE = 'REMOVE';

export const save = createAction(SAVE);

export const saveSuccess = createAction(SAVE_SUCCESS);

export const saveFailure = createAction(SAVE_FAILURE);

export const remove = createAction(REMOVE);

export default handleActions({
  SAVE_SUCCESS: (state, action) => (state.merge(action.meta.merge({ res: action.payload, error: '' }))),
  SAVE_FAILURE: (state, action) => (state.merge(action.meta.merge({ res: action.payload, error: action.payload })))
}, {});
