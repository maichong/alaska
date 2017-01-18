
import React from 'react';

import IntlMessageFormat from 'intl-messageformat';
import { Router, Route, IndexRoute, useRouterHistory } from 'react-router';
import createHashHistory from 'history/lib/createHashHistory';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actions from '../actions';
import qs from 'qs';
import $ from 'jquery';
import _map from 'lodash/map';
import _defaults from 'lodash/defaults';

import Node from './Node.jsx';
import Login from './Login.jsx';
import Locked from './Locked.jsx';
import Manage from './Manage.jsx';
import Dashboard from './Dashboard.jsx';
import Editor from './Editor.jsx';
import List from './List.jsx';
import Modal from 'react-bootstrap/lib/Modal';

const ReactToastr = require('react-toastr');
const { ToastContainer } = ReactToastr;
const ToastMessageFactory = React.createFactory(ReactToastr.ToastMessage.animation);

const createAppHistory = useRouterHistory(createHashHistory);
const history = createAppHistory({
  parseQueryString: qs.parse,
  stringifyQuery: qs.stringify
});

const { node, object, func } = React.PropTypes;

class App extends React.Component {

  static propTypes = {
    views: object.isRequired
  };

  static childContextTypes = {
    actions: object,
    views: object,
    settings: object,
    t: func,
    alert: func,
    confirm: func,
    toast: func,
  };

  constructor(props, context) {
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
      actions: this.props.actions,
      settings: this.props.settings,
      t: this.t,
      alert: this.alert,
      confirm: this.confirm,
      toast: this.toast
    };
  }

  componentDidMount() {
    let props = this.props;
    if (!props.access && !props.signed && !props.login.show) {
      props.actions.refreshInfo();
    }

    $(window).on('resize', this.handleResize);
    this.handleResize();
  }

  componentWillUnmount() {
    $(window).off('resize', this.handleResize)
  }

  handleResize = () => {
    let { layout } = this.props;
    if (window.innerWidth <= 768) {
      if (layout == 'full') {
        this.props.actions.layout('hidden');
      }
    } else {
      if (layout == 'hidden') {
        this.props.actions.layout('full');
      }
    }
  };

  handleCloseModal = () => {
    this.setState({
      modalOpen: false
    });
  };

  alert = (title, body) => {
    return new Promise((resolve, reject) => {
      this.setState({
        modalTitle: title,
        modalBody: body,
        modalActions: <button className={'btn btn-success'}
                              onClick={() => {
                              this.handleCloseModal();
                              resolve();
                              }}>{this.t('Confirm')}</button>,
        modalOpen: true
      });
    });
  };

  confirm = (title, body, buttons = []) => {
    return new Promise((resolve, reject) => {
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
      let modalActions = _map([0, 1], i => {
        let config = buttons[i];
        if (typeof config === 'string') {
          config = {
            title: config
          };
        }
        config = _defaults({}, config, defaults[i]);
        return <button key={i} className={'btn btn-'+config.style} onClick={handles[i]}>{config.title}</button>
      });

      this.setState({
        modalTitle: title,
        modalBody: body,
        modalActions,
        modalOpen: true
      });
    });
  };

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

  render() {
    const props = this.props;
    const state = this.state;
    const views = props.views;
    let el;

    //有权限
    if (props.access) {
      el = <Router history={history}>
        <Route component={Manage} path="/">
          <IndexRoute component={Dashboard} />
          <Route component={List} path="list/:service/:model" />
          <Route component={Editor} path="edit/:service/:model/:id" />
          {
            (views.routes || []).map((item, index) => {
              return <Route key={index} component={item.component} path={item.path} />
            })
          }
        </Route>
      </Router>
    }

    //已登录,但无权限
    else if (props.signed) {
      el = <Locked />;
    }

    //未登录
    else if (props.login.show) {
      el = <Login />;
    } else {
      el = <div className="boot-loading">Loading...</div>;
    }

    return ( <Node id="app" className={props.layout}>
      {el}
      <ToastContainer
        ref="container"
        toastMessageFactory={ToastMessageFactory}
        className="toast-top-right" />
      <Modal show={state.modalOpen}>
        <div className="modal-header">{state.modalTitle}</div>
        <div className="modal-body">{state.modalBody}</div>
        <div className="modal-footer">{state.modalActions}</div>
      </Modal>
    </Node>);
  }
}

export default connect(({ login, access, signed, settings, layout }) => ({
  login,
  access,
  signed,
  settings,
  layout
}), dispatch => ({
  actions: bindActionCreators(actions, dispatch)
}))(App);
