import * as _ from 'lodash';
import { createAction, handleActions } from 'redux-actions';
import * as immutable from 'seamless-immutable';
import { QueryCachesState, QueryCache, ClearQueryCachePayload, ClearListPayload } from '..';

export const APPLY_QUERY_CACHE = 'APPLY_QUERY_CACHE';
export const CLEAR_QUERY_CACHE = 'CLEAR_QUERY_CACHE';

/**
 * 设置缓存
 */
export const applyQueryCache = createAction<Cache>(APPLY_QUERY_CACHE);
/**
 * 清除缓存
 */
export const clearQueryCache = createAction<ClearQueryCachePayload>(CLEAR_QUERY_CACHE);

// 初始state
const INITIAL_STATE: QueryCachesState = immutable({
});

export default handleActions({
  REFRESH: () => INITIAL_STATE,
  APPLY_QUERY_CACHE: (state, action) => {
    // @ts-ignore
    const payload: QueryCache = action.payload;
    let caches: QueryCache[] = state[payload.model] || immutable([]);
    let found = false;
    caches = caches.map((cache: QueryCache) => {
      if (cache.search === payload.search && _.isEqual(cache.filters, payload.filters)) {
        found = true;
        return payload;
      }
      return cache;
    });

    if (!found) {
      caches = caches.concat([payload]);
    }

    let time = Date.now() - 2 * 60 * 1000;

    caches = caches.filter((cache) => cache.time > time);

    return state.set(payload.model, caches);
  },
  CLEAR_QUERY_CACHE: (state, action) => {
    // @ts-ignore
    const payload: ClearQueryCachePayload = action.payload;
    return state.without(payload.model);
  },
  CLEAR_LIST: (state, action) => {
    // @ts-ignore
    const payload: ClearListPayload = action.payload;
    return payload.model ? state.without(payload.model) : INITIAL_STATE;
  }
}, INITIAL_STATE);
