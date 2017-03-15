import { createAction, handleActions } from 'redux-actions';

export const UPDATE_LAYOUT = 'UPDATE_LAYOUT';

export const updateLayout = createAction(UPDATE_LAYOUT);

export default handleActions({
  UPDATE_LAYOUT: (state, action) => {
    if (window.localStorage) {
      window.localStorage.setItem('layout', action.payload);
    }
    return state.merge(action.payload);
  }
}, window.localStorage.getItem('layout') || 'full');
