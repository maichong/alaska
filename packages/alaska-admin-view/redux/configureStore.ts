import { createStore, compose, applyMiddleware, Reducer } from 'redux';
import { createLogger } from 'redux-logger';
import createSagaMiddleware from 'redux-saga';

type Saga0 = () => Iterator<any>;

export default function configureStore(rootReducer: Reducer, rootSaga: Saga0) {
  const middleware = [];
  const enhancers = [];

  // saga中间件
  const sagaMiddleware = createSagaMiddleware();
  middleware.push(sagaMiddleware);
  // log中间件
  const SAGA_LOGGING_BLACKLIST = ['EFFECT_TRIGGERED', 'EFFECT_RESOLVED', 'EFFECT_REJECTED'];
  if (process.env.NODE_ENV === 'development') {
    const logger = createLogger({
      predicate: (getState, { type }) => SAGA_LOGGING_BLACKLIST.indexOf(type) === -1
    });
    middleware.push(logger);
  }

  // 合并中间件
  enhancers.push(applyMiddleware(...middleware));

  const store = createStore(rootReducer, compose(...enhancers));

  // kick off root saga
  sagaMiddleware.run(rootSaga);

  setTimeout(() => store.dispatch({ type: 'STARTUP' }), 0);

  return store;
}
