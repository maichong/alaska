/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-02-25
 * @author Liang <liang@maichong.it>
 */

import ReactDOM from 'react-dom';
import React from 'react';
import { Provider } from 'react-redux';
import { App, store, akita } from 'alaska-admin-view';
import * as views from '../runtime/alaska-admin-view/views.js';

ReactDOM.render(
  <Provider store={store}>
    <App views={views} />
  </Provider>
  , document.getElementById('viewport')
);
