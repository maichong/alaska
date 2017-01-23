import { createAction, handleActions } from 'redux-actions';

export const LAYOUT = 'LAYOUT';

export const layout = createAction(LAYOUT);

export default handleActions({
  LAYOUT: (state, action) => {
    if (window.localStorage) {
      window.localStorage.setItem('layout', action.payload);
    }
    return state.merge(action.payload);
  }
}, window.localStorage.getItem('layout') || 'full');
