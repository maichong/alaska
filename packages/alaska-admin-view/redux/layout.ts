import { createAction, handleActions } from 'redux-actions';
import { Layout } from 'alaska-admin-view';
import { getStorage, setStorage } from '../utils/storage';

export const APPLY_LAYOUT = 'APPLY_LAYOUT';

export const applyLayout = createAction<Layout>(APPLY_LAYOUT);

export default handleActions(
  {
    APPLY_LAYOUT: (state: Layout, action) => {
      setStorage('layout', action.payload);
      return action.payload;
    }
  }, (
    getStorage('layout') || 'full'
  )
);
