// @flow

import { createStore, compose, applyMiddleware } from 'redux';
import reduxPersist, { persistStore, autoRehydrate } from 'redux-persist';
import createLogger from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import * as StartupActions from './startup';

export default function (rootReducer:any, rootSaga:any) {
  const middleware = [];
  const enhancers = [];

  // saga中间件
  const sagaMiddleware = createSagaMiddleware();
  middleware.push(sagaMiddleware);
  // log中间件
  const SAGA_LOGGING_BLACKLIST = ['EFFECT_TRIGGERED', 'EFFECT_RESOLVED', 'EFFECT_REJECTED'];
  if (__DEV__) {
    const logger = createLogger({
      predicate: (getState, { type }) => SAGA_LOGGING_BLACKLIST.indexOf(type) === -1
    });
    middleware.push(logger);
  }

  // 合并中间件
  enhancers.push(applyMiddleware(...middleware));

  // persist rehydrate
  enhancers.push(autoRehydrate());

  const store = createStore(rootReducer, compose(...enhancers));

  // persist
  persistStore(store, reduxPersist, () => store.dispatch(StartupActions.startup()));

  // kick off root saga
  sagaMiddleware.run(rootSaga);

  return store;
}
