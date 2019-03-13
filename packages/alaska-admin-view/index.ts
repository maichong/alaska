import store from './redux/index';
import App from './views/App';
import api from './utils/api';
import query from './utils/query';
import checkAbility, { hasAbility } from './utils/check-ability';
import { getStorage, setStorage, removeStorage } from './utils/storage';
import views, { setViews } from './utils/views';
import { execAction } from './redux/action';
import { } from 'alaska-admin-view';

export {
  store,
  App,
  api,
  query,
  setViews,
  views,
  getStorage,
  setStorage,
  removeStorage,
  checkAbility,
  hasAbility,
  execAction,
};
