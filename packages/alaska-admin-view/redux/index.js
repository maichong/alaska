import { combineReducers } from 'redux';
import configureStore from './store';
import rootSaga from '../sagas/';

import accessReducer from './access';
import detailsReducer from './details';
import layoutReducer from './layout';
import listsReducer from './lists';
import loginReducer from './login';
import saveReducer from './save';
import settingsReducer from './settings';
import signedReducer from './signed';
import userReducer from './user';

function createStore() {
  const rootReducer = combineReducers({
    login: loginReducer,
    signed: signedReducer,
    user: userReducer,
    access: accessReducer,
    settings: settingsReducer,
    lists: listsReducer,
    details: detailsReducer,
    layout: layoutReducer,
    save: saveReducer
  });

  return configureStore(rootReducer, rootSaga);
}

export default createStore();
