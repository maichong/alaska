import * as _ from 'lodash';
import { Cache, CachesState, QueryOptions } from '..';
import api from './api';
import store from '../redux';
import { applyCache } from '../redux/caches';
import * as immutable from 'seamless-immutable';

export default function (options: QueryOptions): Promise<Cache> {
  let search = options.search || '';
  let filters = options.filters || null;
  let state: CachesState = store.getState().caches;
  if (state[options.model]) {
    let caches = state[options.model];
    for (let cache of caches) {
      if (cache.search === search && _.isEqual(cache.filters, filters) && _.isEqual(cache.populations, options.populations)) {
        return Promise.resolve(cache);
      }
    }
  }

  return api.get('/list', {
    query: _.assign({
      _model: options.model,
      _search: search,
      _populations: options.populations,
      _limit: 1000,
      _page: 1
    }, filters)
  }).then((result) => {
    result.model = options.model;
    result.filters = filters;
    result.populations = options.populations;
    result.time = Date.now();
    result = immutable(result);
    store.dispatch(applyCache(result));
    return result;
  });
}
