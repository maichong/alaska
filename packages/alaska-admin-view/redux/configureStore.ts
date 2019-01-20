import { createStore, compose, applyMiddleware, Reducer } from 'redux';
import { createLogger } from 'redux-logger';
import createSagaMiddleware from 'redux-saga';
import { Saga } from '@redux-saga/types';
import { Store } from '..';

export default function configureStore(rootReducer: Reducer, rootSaga: Saga): Store {
  const middleware = [];
  const enhancers = [];

  // saga中间件
  const sagaMiddleware = createSagaMiddleware();
  middleware.push(sagaMiddleware);
  // log中间件
  if (process.env.NODE_ENV === 'development') {
    const logger = createLogger();
    middleware.push(logger);
  }

  // 合并中间件
  enhancers.push(applyMiddleware(...middleware));

  const store: Store = createStore(rootReducer, compose(...enhancers));

  // kick off root saga
  sagaMiddleware.run(rootSaga);

  setTimeout(() => store.dispatch({ type: 'STARTUP' }), 0);

  store.runSaga = sagaMiddleware.run;

  return store;
}
