import { createAction, handleActions } from 'redux-actions';

export const APPLY_LAYOUT = 'APPLY_LAYOUT';

export const applyLayout = createAction(APPLY_LAYOUT);

export default handleActions({
  APPLY_LAYOUT: (state, action) => {
    if (window.localStorage) {
      window.localStorage.setItem('layout', action.payload);
    }
    return state.merge(action.payload);
  }
}, window.localStorage.getItem('layout') || 'full');
