import { createAction, handleActions } from 'redux-actions';
import immutable from 'seamless-immutable';

export const SAVE = 'SAVE';
export const SAVE_SUCCESS = 'SAVE_SUCCESS';
export const SAVE_FAILURE = 'SAVE_FAILURE';

/**
 * @param {Object} options
 * @param {string} options.key
 * @param {string} options.service
 * @param {string} options.model
 * @param {number} options._r
 * @param {Object} data
 */
export const save = createAction(SAVE, (options, data) => Object.assign({ data }, options));

/**
 * @param {Object} options
 * @param {string} options.key
 * @param {string} options.service
 * @param {string} options.model
 * @param {number} options._r
 * @param {Object} res
 */
export const saveSuccess = createAction(SAVE_SUCCESS, (options, res) => Object.assign({ res }, options));

/**
 * @param {Object} options
 * @param {string} options.key
 * @param {string} options.service
 * @param {string} options.model
 * @param {number} options._r
 * @param {Error} error
 */
export const saveFailure = createAction(SAVE_FAILURE, (options, error) => Object.assign({ error }, options));

// 初始state
export const INITIAL_STATE = immutable({
  error: null,
  fetching: false,
  key: '',
  _r: 0,
  res: {}
});

export default handleActions({
  SAVE: (state, { payload }) => state.merge({
    error: null, fetching: true, key: payload.key, _r: payload._r, res: {}
  }),
  SAVE_SUCCESS: (state, { payload }) => state.merge({
    error: null,
    fetching: false,
    key: payload.key,
    _r: payload._r,
    res: payload.res
  }),
  SAVE_FAILURE: (state, { payload }) => state.merge({
    error: { message: payload.error.message, code: payload.error.code },
    fetching: false,
    key: payload.key,
    _r: payload._r,
    res: {}
  }),
  LOGOUT: () => INITIAL_STATE
}, INITIAL_STATE);
