import { createAction, handleActions } from 'redux-actions';
import _ from 'lodash';

export const REFRESH = 'REFRESH';
export const LIST = 'LIST';
export const LIST_SUCCESS = 'LIST_SUCCESS';
export const SAVE_SUCCESS = 'SAVE_SUCCESS';

export const list = createAction(LIST, (args) => (args));

export const listSuccess = createAction(LIST_SUCCESS, (res, args) => ({ res, args }));

function listReducer(state, action) {
  let key = action.args.meta ? action.args.meta.key : '';
  if (key) {
    let res = action.payload.res;
    let data = Object.assign({}, action.meta, res);
    if (action.payload.res.page !== 1 && state[key]) {
      data.results = state[key].results.concat(data.results);
    }
    state.merge({ [key]: data });
  }
}

function saveReducer(state, action) {
  let key = action.meta ? action.meta.key : '';
  return _.omit(state, key);
}

export default handleActions({
  REFRESH: () => ({}),
  LIST_SUCCESS: listReducer,
  SAVE_SUCCESS: saveReducer
}, {});
