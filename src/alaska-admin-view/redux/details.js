import { createAction, handleActions } from 'redux-actions';
import immutable from 'seamless-immutable';

export const LOAD_DETAILS = 'LOAD_DETAILS';
export const APPLY_DETAILS = 'APPLY_DETAILS';
export const BATCH_APPLY_DETAILS = 'BATCH_APPLY_DETAILS';
export const CLEAR_DETAILS = 'CLEAR_DETAILS';
export const BATCH_CLEAR_DETAILS = 'BATCH_CLEAR_DETAILS';

/**
 * 清除详情
 * @param {Object} item
 * @param {string} item.key
 * @param {string[]} [item.ids]
 */
export const clearDetails = createAction(CLEAR_DETAILS);

/**
 * 批量清除详情
 * @param {Array<{key:string, ids:string[]}>} list
 */
export const batchClearDetails = createAction(BATCH_CLEAR_DETAILS);

/**
 * 加载详情
 * @param {Object} item
 * @param {string} item.service
 * @param {string} item.model
 * @param {string} item.key
 * @param {string} item.id
 */
export const loadDetails = createAction(LOAD_DETAILS);

/**
 * 成功获得详情数据
 * @param {string} key
 * @param {Object} data
 */
export const applyDetails = createAction(APPLY_DETAILS, (key, data) => ({ key, data }));

/**
 * 批量更新详情数据
 * @param {Array<{key:string, data:Object}>} list
 */
export const batchApplyDetails = createAction(BATCH_APPLY_DETAILS);

// 初始state
export const INITIAL_STATE: {
  [key: string]: {
    [id: string]: Object
  }
} = immutable({});

export default handleActions({
  CLEAR_DETAILS: (state, { payload }) => {
    let { key, ids } = payload;
    if (!ids) {
      return state.without(key);
    }
    let list = state[key];
    if (!list) return state;
    list = list.without(ids);
    return state.set(key, list);
  },
  BATCH_CLEAR_DETAILS: (state, { payload }) => {
    payload.forEach(({ key, ids }) => {
      if (ids) {
        let list = state[key];
        if (list) {
          list = list.without(ids);
          state = state.set(key, list);
        }
      } else {
        state = state.without(key);
      }
    });
    return state;
  },
  APPLY_DETAILS: (state, { payload }) => {
    let { key, data } = payload;
    let datas = state[key] || immutable({});
    datas = datas.set(data._id, data);
    return state.set(key, datas);
  },
  BATCH_APPLY_DETAILS: (state, { payload }) => {
    for (let { key, data } of payload) {
      let datas = state[key] || immutable({});
      datas = datas.set(data._id, data);
      state = state.set(key, datas);
    }
    return state;
  },
  LOGOUT: () => INITIAL_STATE
}, INITIAL_STATE);
