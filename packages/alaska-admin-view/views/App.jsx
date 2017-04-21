// @flow

import React from 'react';
import PropTypes from 'prop-types';
import IntlMessageFormat from 'intl-messageformat';
import { Router, Route, IndexRoute, useRouterHistory } from 'react-router';
import createHashHistory from 'history/lib/createHashHistory';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'react-bootstrap';
import { ToastContainer, ToastMessage } from 'react-toastr';
import qs from 'qs';
import _ from 'lodash';
import * as layoutRedux from '../redux/layout';
import Node from './Node';
import Login from './Login';
import Locked from './Locked';
import Manage from './Manage';
import Dashboard from './Dashboard';
import EditorPage from './EditorPage';
import ListPage from './ListPage';
import type { Settings, User } from '../types';

const ToastMessageFactory = React.createFactory(ToastMessage.animation);

const createAppHistory = useRouterHistory(createHashHistory);
const history = createAppHistory({
  parseQueryString: qs.parse,
  stringifyQuery: qs.stringify
});

class App extends React.Component {

  static childContextTypes = {
    views: PropTypes.object,
    settings: PropTypes.object,
    t: PropTypes.func,
    alert: PropTypes.func,
    confirm: PropTypes.func,
    toast: PropTypes.func,
  };

  props: {
    views: Object,
    user: User,
    settings: Settings,
    layout: string,
    applyLayout: Function
  };

  state: {
    modalTitle: string;
    modalBody: string;
    modalOpen: boolean;
    modalActions: any;
  };
  _messageCache: Object;

  constructor(props: Object) {
    super(props);
    this.state = {
      modalTitle: '',
      modalBody: '',
      modalOpen: false,
      modalActions: []
    };
    this._messageCache = {};
  }

  getChildContext() {
    return {
      views: this.props.views,
      settings: this.props.settings,
      t: this.t,
      alert: this.alert,
      confirm: this.confirm,
      toast: this.toast
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener(this.handleResize);
  }

  t = (message, serviceId, values, formats) => {
    if (typeof serviceId === 'object') {
      formats = values;
      values = serviceId;
      serviceId = 'alaska-admin';
    }
    if (!serviceId) {
      serviceId = 'alaska-admin';
    }
    let all = this.props.settings.locales.all;
    let locales = this.props.settings.locales[serviceId];
    let locale = this.props.settings.locale;
    if (!locales || !locales[locale]) {
      //没有找到特定模块的特定翻译

      locales = all;
      if (!locales || !locales[locale]) {
        //没有找到所有模块翻译
        return message;
      }
    }

    let messages = locales[locale];
    let messageTemp = messages[message];
    if (!messageTemp) {
      if (all[locale]) {
        messages = all[locale];
        messageTemp = messages[message];
      }
      if (!messageTemp) {
        //没有找到所有模块翻译
        return message;
      }
    }
    if (!values) {
      return messageTemp;
    }

    if (!this._messageCache[locale]) {
      this._messageCache[locale] = {};
    }

    if (!this._messageCache[locale][message]) {
      this._messageCache[locale][message] = new IntlMessageFormat(messageTemp, locale, formats);
    }
    return this._messageCache[locale][message].format(values);
  };

  alert = (title, body) => (new Promise(
      (resolve) => {
        this.setState({
          modalTitle: title,
          modalBody: body,
          modalActions: <button
            className={'btn btn-success'}
            onClick={() => {
              this.handleCloseModal();
              resolve();
            }}
          >{this.t('Confirm')}</button>,
          modalOpen: true
        });
      })
  );

  confirm = (title, body, buttons = []) => (new Promise(
      (resolve, reject) => {
        let defaults = [{
          title: this.t('Confirm'),
          style: 'success'
        }, {
          title: this.t('Cancel'),
          style: 'default'
        }];
        let handles = [() => {
          this.handleCloseModal();
          resolve();
        }, () => {
          this.handleCloseModal();
          reject();
        }];
        let modalActions = _.map([0, 1], (i) => {
          let config = buttons[i];
          if (typeof config === 'string') {
            config = {
              title: config
            };
          }
          config = _.defaults({}, config, defaults[i]);
          return <button key={i} className={'btn btn-' + config.style} onClick={handles[i]}>{config.title}</button>;
        });

        this.setState({
          modalTitle: title,
          modalBody: body,
          modalActions,
          modalOpen: true
        });
      })
  );

  toast = (method, title, body, options) => {
    if (typeof body === 'object') {
      options = body;
      body = '';
    }
    options = options || {};
    if (options.closeButton !== false) {
      options.closeButton = true;
    }
    if (!options.showAnimation) {
      options.showAnimation = 'fadeIn';
    }
    if (!options.hideAnimation) {
      options.hideAnimation = 'fadeOut';
    }
    if (!options.timeOut) {
      options.timeOut = 10000;
    }
    this.refs.container[method](title, body, options);
  };

  handleCloseModal = () => {
    this.setState({
      modalOpen: false
    });
  };

  handleResize = () => {
    let { layout } = this.props;
    if (window.innerWidth <= 768) {
      if (layout === 'full') {
        this.props.applyLayout('hidden');
      }
    } else if (layout === 'hidden') {
      this.props.applyLayout('full');
    }
  };

  render() {
    const { layout, user, settings, views } = this.props;
    const state = this.state;
    let el;

    //有权限
    if (user.access) {
      el = <Router history={history}>
        <Route component={Manage} path="/">
          <IndexRoute component={Dashboard} />
          <Route component={ListPage} path="list/:service/:model" />
          <Route component={EditorPage} path="edit/:service/:model/:id" />
          {
            (views.routes || []).map(
              (item, index) => (<Route key={index} component={item.component} path={item.path} />))
          }
        </Route>
      </Router>;
    } else if (user.id) { //已登录,但无权限
      el = <Locked />;
    } else if (settings.locale) {  //未登录,已加载设置
      el = <Login />;
    } else {
      el = <div className="boot-loading">Loading...</div>;
    }

    return (<Node id="app" className={layout}>
      {el}
      <ToastContainer
        ref="container"
        toastMessageFactory={ToastMessageFactory}
        className="toast-top-right"
      />
      <Modal show={state.modalOpen}>
        <div className="modal-header">{state.modalTitle}</div>
        <div className="modal-body">{state.modalBody}</div>
        <div className="modal-footer">{state.modalActions}</div>
      </Modal>
    </Node>);
  }
}

export default connect(({ user, settings, layout }) => ({
  user,
  settings,
  layout
}), (dispatch) => bindActionCreators({
  applyLayout: layoutRedux.applyLayout
}, dispatch))(App);
