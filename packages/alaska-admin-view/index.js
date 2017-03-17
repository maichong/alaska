// @flow

import akita from 'akita';
import store from './redux/index';
import App from './views/App';

akita.setOptions({
  apiRoot: window.PREFIX,
  init: {
    credentials: 'include'
  }
});

export { store, App };
