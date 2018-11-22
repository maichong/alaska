import { createAction, handleActions } from 'redux-actions';
import { Layout } from 'alaska-admin-view';

export const APPLY_LAYOUT = 'APPLY_LAYOUT';

export const applyLayout = createAction<Layout>(APPLY_LAYOUT);

export default handleActions(
  {
    APPLY_LAYOUT: (state: Layout, action) => {
      if (window.localStorage) {
        window.localStorage.setItem('layout', action.payload);
      }
      return action.payload;
    }
  }, (
    (window.localStorage ? window.localStorage.getItem('layout') : '') || 'full'
  )
);
