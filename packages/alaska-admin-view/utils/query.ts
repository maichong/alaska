import * as _ from 'lodash';
import { QueryCache, QueryCachesState, QueryOptions } from '..';
import api from './api';
import store from '../redux';
import { applyQueryCache } from '../redux/queryCaches';
import * as immutable from 'seamless-immutable';

export default function (options: QueryOptions): Promise<QueryCache> {
  let search = options.search || '';
  let filters = options.filters || null;
  let state: QueryCachesState = store.getState().queryCaches;
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
    result.search = search;
    result.populations = options.populations;
    result.time = Date.now();
    result = immutable(result);
    store.dispatch(applyQueryCache(result));
    return result;
  });
}
