import { combineReducers } from 'redux';
import configureStore from './configureStore';
import rootSaga from '../sagas/';

import detailsReducer from './details';
import layoutReducer from './layout';
import listsReducer from './lists';
import loginReducer from './login';
import saveReducer from './save';
import settingsReducer from './settings';
import userReducer from './user';

function createStore() {
  const rootReducer = combineReducers({
    login: loginReducer,
    user: userReducer,
    settings: settingsReducer,
    lists: listsReducer,
    details: detailsReducer,
    layout: layoutReducer,
    save: saveReducer
  });

  return configureStore(rootReducer, rootSaga);
}

export default createStore();
