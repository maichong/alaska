import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { Provider } from 'react-redux';
import { App, store, setViews } from 'alaska-admin-view';
// import 'moment/locale/zh-cn';
import * as views from '../../runtime/alaska-admin-view/views';
import '../../scss/admin.scss';
require('codemirror/mode/javascript/javascript');

setViews(views);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>
  , document.getElementById('__viewport')
);
