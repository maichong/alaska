import { combineReducers } from 'redux';
import configureStore from './configureStore';
import rootSaga from '../sagas';

import cachesReducer from './caches';
import detailsReducer from './details';
import layoutReducer from './layout';
import listsReducer from './lists';
import loginReducer from './login';
import settingsReducer from './settings';
import userReducer from './user';
import menusReducer from './menus';
import actionReducer from './action';

function createStore() {
  const rootReducer = combineReducers({
    caches: cachesReducer,
    login: loginReducer,
    user: userReducer,
    settings: settingsReducer,
    lists: listsReducer,
    details: detailsReducer,
    layout: layoutReducer,
    menus: menusReducer,
    action: actionReducer
  });

  return configureStore(rootReducer, rootSaga);
}

const store = createStore();

// @ts-ignore
window.store = store;

export default store;
