import * as _ from 'lodash';
import { createAction, handleActions } from 'redux-actions';
import * as immutable from 'seamless-immutable';
import { CachesState, Cache } from 'alaska-admin-view';

export const APPLY_CACHE = 'APPLY_CACHE';

/**
 * 设置缓存
 */
export const applyCache = createAction<Cache>(APPLY_CACHE);

// 初始state
export const INITIAL_STATE: CachesState = immutable({
});

export default handleActions({
  APPLY_CACHE: (state, action) => {
    // @ts-ignore
    const payload: Cache = action.payload;
    let caches: Cache[] = state[payload.model] || immutable([]);
    let found = false;
    caches = caches.map((cache: Cache) => {
      if (cache.search === payload.search || _.isEqual(cache.filters, payload.filters)) {
        found = true;
        return payload;
      }
      return cache;
    });

    if (!found) {
      caches = caches.concat([payload]);
    }

    return state.set(payload.model, caches);
  }
}, INITIAL_STATE);
