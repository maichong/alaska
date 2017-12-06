'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = configureStore;

var _redux = require('redux');

var _reduxLogger = require('redux-logger');

var _reduxSaga = require('redux-saga');

var _reduxSaga2 = _interopRequireDefault(_reduxSaga);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function configureStore(rootReducer, rootSaga) {
  const middleware = [];
  const enhancers = [];

  // saga中间件
  const sagaMiddleware = (0, _reduxSaga2.default)();
  middleware.push(sagaMiddleware);
  // log中间件
  const SAGA_LOGGING_BLACKLIST = ['EFFECT_TRIGGERED', 'EFFECT_RESOLVED', 'EFFECT_REJECTED'];
  if (process.env.NODE_ENV === 'development') {
    const logger = (0, _reduxLogger.createLogger)({
      predicate: (getState, { type }) => SAGA_LOGGING_BLACKLIST.indexOf(type) === -1
    });
    middleware.push(logger);
  }

  // 合并中间件
  enhancers.push((0, _redux.applyMiddleware)(...middleware));

  // $Flow
  const store = (0, _redux.createStore)(rootReducer, (0, _redux.compose)(...enhancers));

  // kick off root saga
  sagaMiddleware.run(rootSaga);

  setTimeout(() => store.dispatch({ type: 'STARTUP' }));

  return store;
}