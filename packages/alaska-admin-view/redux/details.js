import { createAction, handleActions } from 'redux-actions';
import immutable from 'seamless-immutable';

export const LOAD_DETAILS = 'LOAD_DETAILS';
export const APPLY_DETAILS = 'APPLY_DETAILS';

/**
 * 加载详情
 * @param {Object} options
 * @param {string} options.service
 * @param {string} options.model
 * @param {string} options.key
 * @param {string} options.id
 */
export const loadDetails = createAction(LOAD_DETAILS);

/**
 * 成功获得详情数据
 * @param {string} key
 * @param {Object} data
 */
export const applyDetails = createAction(APPLY_DETAILS, (key, data) => ({ key, data }));

// 初始state
export const INITIAL_STATE: {
  [key:string]:{
    [id:string]:Object
  }
} = immutable({});

export default handleActions({
  APPLY_DETAILS: (state, { payload }) => {
    let { key, data } = payload;
    let datas = state[key] || immutable({});
    datas = datas.set(data._id, data);
    return state.set(key, datas);
  },
  LOGOUT: () => INITIAL_STATE
}, INITIAL_STATE);
