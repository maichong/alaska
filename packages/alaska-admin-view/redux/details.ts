import { createAction, handleActions } from 'redux-actions';
import * as immutable from 'seamless-immutable';
import {
  AnyRecordMap,
  DetailsState,
  ClearDetailsPayload,
  LoadDetailsPayload,
  ApplyDetailsPayload
} from 'alaska-admin-view';

export const LOAD_DETAILS = 'LOAD_DETAILS';
export const APPLY_DETAILS = 'APPLY_DETAILS';
export const BATCH_APPLY_DETAILS = 'BATCH_APPLY_DETAILS';
export const CLEAR_DETAILS = 'CLEAR_DETAILS';
export const BATCH_CLEAR_DETAILS = 'BATCH_CLEAR_DETAILS';

/**
 * 清除详情
 * @param {Object}   item
 * @param {string}   item.model
 * @param {string[]} [item.ids]
 */
export const clearDetails = createAction<ClearDetailsPayload>(CLEAR_DETAILS);

/**
 * 批量清除详情
 * @param {Array<{model:string, ids:string[]}>} list
 */
export const batchClearDetails = createAction<ClearDetailsPayload[]>(BATCH_CLEAR_DETAILS);

/**
 * 加载详情
 * @param {Object} item
 * @param {string} item.model
 * @param {string} item.id
 */
export const loadDetails = createAction<LoadDetailsPayload>(LOAD_DETAILS);

/**
 * 成功获得详情数据
 * @param {string} model
 * @param {Object} data
 */
export const applyDetails = createAction(APPLY_DETAILS, (model: string, data: any) => ({ model, data }));

/**
 * 批量更新详情数据
 * @param {Array<{model:string, data:Object}>} list
 */
export const batchApplyDetails = createAction<ApplyDetailsPayload[]>(BATCH_APPLY_DETAILS);

// 初始state
export const INITIAL_STATE: DetailsState = immutable({});

export default handleActions({
  CLEAR_DETAILS: (state, action) => {
    // @ts-ignore
    const payload: ClearDetailsPayload = action.payload;
    const { model, ids } = payload;
    if (!ids) {
      return state.without(model);
    }
    let map: AnyRecordMap = state[model];
    if (!map) return state;
    map = map.without(ids);
    return state.set(model, map);
  },
  BATCH_CLEAR_DETAILS: (state: DetailsState, action) => {
    // @ts-ignore
    const payload: ClearDetailsPayload[] = action.payload;
    payload.forEach(({ model, ids }) => {
      if (ids) {
        let map: AnyRecordMap = state[model];
        if (map) {
          map = map.without(ids);
          state = state.set(model, map);
        }
      } else {
        state = state.without(model);
      }
    });
    return state;
  },
  APPLY_DETAILS: (state: DetailsState, action) => {
    // @ts-ignore
    const payload: ApplyDetailsPayload = action.payload;
    let { model, data } = payload;
    let map: AnyRecordMap = state[model] || immutable({});
    map = map.set(data._id, data);
    return state.set(model, map);
  },
  BATCH_APPLY_DETAILS: (state: DetailsState, action) => {
    // @ts-ignore
    const payload: ApplyDetailsPayload[] = action.payload;
    for (let { model, data } of payload) {
      let map: AnyRecordMap = state[model] || immutable({});
      map = map.set(data._id, data);
      state = state.set(model, map);
    }
    return state;
  },
  LOGOUT: () => INITIAL_STATE
}, INITIAL_STATE);