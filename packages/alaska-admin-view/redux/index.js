import { combineReducers } from 'redux';
import configureStore from './store';
import rootSaga from '../sagas/';

import loginReducer from './login';
import signedReducer from './signed';
import userReducer from './user';
import accessReducer from './access';
import settingsReducer from './settings';
import listsReducer from './lists';

function createStore() {
  const rootReducer = combineReducers({
    login: loginReducer,
    signed: signedReducer,
    user: userReducer,
    access: accessReducer,
    settings: settingsReducer,
    lists: listsReducer
  });

  return configureStore(rootReducer, rootSaga);
}

export default createStore();
