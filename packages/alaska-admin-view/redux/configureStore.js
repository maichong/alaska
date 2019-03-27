"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redux_1 = require("redux");
const redux_logger_1 = require("redux-logger");
const redux_saga_1 = require("redux-saga");
function configureStore(rootReducer, rootSaga) {
    const middleware = [];
    const enhancers = [];
    const sagaMiddleware = redux_saga_1.default();
    middleware.push(sagaMiddleware);
    if (process.env.NODE_ENV === 'development') {
        const logger = redux_logger_1.createLogger();
        middleware.push(logger);
    }
    enhancers.push(redux_1.applyMiddleware(...middleware));
    const store = redux_1.createStore(rootReducer, redux_1.compose(...enhancers));
    sagaMiddleware.run(rootSaga);
    setTimeout(() => store.dispatch({ type: 'STARTUP' }), 0);
    store.runSaga = sagaMiddleware.run;
    return store;
}
exports.default = configureStore;
