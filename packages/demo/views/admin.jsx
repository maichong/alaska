/**
 * @copyright Maichong Software Ltd. 2016 http://maichong.it
 * @date 2016-02-25
 * @author Liang <liang@maichong.it>
 */

'use strict';

import { App, store } from 'alaska-admin-view';
import * as views from '../runtime/alaska-admin-view/views.js';

import ReactDOM from 'react-dom';
import React from 'react';

import { Provider } from 'react-redux';

ReactDOM.render(
  <Provider store={store}>
    <App views={views}/>
  </Provider>
  , document.getElementById('app')
);
