/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-02-25
 * @author Liang <liang@maichong.it>
 */

import { createStore, combineReducers, applyMiddleware } from 'redux';
import promiseMiddleware from 'redux-promise';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import * as reducers from './reducers/index';

const defaultReducers = reducers.default;
delete reducers.default;
const reducer = combineReducers(reducers);

let middlewares = [thunkMiddleware, promiseMiddleware];

if (process.env.NODE_ENV != 'production') {
  middlewares.push(createLogger());
}

export default createStore((state, action) => reducer(defaultReducers(state, action), action), applyMiddleware(...middlewares));
