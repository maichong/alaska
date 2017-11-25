// @flow

import api from 'akita';
import store from './redux/index';
import App from './views/App';

api.setOptions({
  apiRoot: window.PREFIX,
  init: {
    credentials: 'include'
  }
});

export { store, App, api };
