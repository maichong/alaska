import { createAction, handleActions } from 'redux-actions';

export const REFRESH = 'REFRESH';
export const LIST_SUCCESS = 'LIST_SUCCESS';
export const DETAILS = 'DETAILS';
export const DETAILS_SUCCESS = 'DETAILS_SUCCESS';
export const SAVE_SUCCESS = 'SAVE_SUCCESS';

export const details = createAction(DETAILS);

export const detailsSuccess = createAction(DETAILS_SUCCESS);

function listReducer(state, action) {
  let key = action.meta ? action.meta.key : '';
  if (key) {
    let results = action.payload.results;
    let tmp = {};
    for (let i = 0; i < results.length; i += 1) {
      let record = results[i];
      tmp[record._id] = record;
    }
    state.merge({ [key]: state[key].merge(tmp) });
  }
}
function detailSaveReducer(state, action) {
  let key = action.meta ? action.meta.key : '';
  if (key && action.payload._id) {
    let data = action.payload;
    state.merge({ [key]: state[key].merge({ [data._id]: data }) });
  }
}
export default handleActions({
  REFRESH: () => ({}),
  LIST_SUCCESS: listReducer,
  DETAILS_SUCCESS: detailSaveReducer,
  SAVE_SUCCESS: detailSaveReducer
}, {});
