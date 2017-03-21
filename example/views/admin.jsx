import ReactDOM from 'react-dom';
import React from 'react';
import { Provider } from 'react-redux';
import { App, store } from 'alaska-admin-view';
import * as views from '../runtime/alaska-admin-view/views.js';

ReactDOM.render(
  <Provider store={store}>
    <App views={views} />
  </Provider>
  , document.getElementById('viewport')
);
