// @flow

import React from 'react';
import PropTypes from 'prop-types';
import IntlMessageFormat from 'intl-messageformat';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal } from 'react-bootstrap';
import { ToastContainer } from 'react-toastr';
import _ from 'lodash';
import * as layoutRedux from '../redux/layout';
import Node from './Node';
import Login from './Login';
import Locked from './Locked';
import Manage from './Manage';
import Dashboard from './Dashboard';
import EditorPage from './EditorPage';
import ListPage from './ListPage';
import NotFoundPage from './NotFoundPage';

type Props = {
  views: Object,
  user: Alaska$view$User,
  settings: Alaska$view$Settings,
  layout: string,
  applyLayout: Function
};

type State = {
  modalTitle: string,
  modalBody: string,
  modalOpen: boolean,
  modalActions: any
};

class App extends React.Component<Props, State> {
  static childContextTypes = {
    views: PropTypes.object,
    settings: PropTypes.object,
    t: PropTypes.func,
    alert: PropTypes.func,
    confirm: PropTypes.func,
    toast: PropTypes.func,
  };

  toastContainer: void | React$Node;
  _messageCache: Object;

  _page: void | React$Node;
  _pageInfo: any;

  constructor(props: Props) {
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

  t = (message: string, serviceId?: string, values?: Object, formats?: Object) => {
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

  alert = (title: string, body?: string): Promise<void> => new Promise((resolve) => {
    this.setState({
      modalTitle: title,
      modalBody: body,
      modalActions: <button
        className="btn btn-success"
        onClick={() => {
          this.handleCloseModal();
          resolve();
        }}
      >{this.t('Confirm')}
      </button>,
      modalOpen: true
    });
  });

  // eslint-disable-next-line max-len
  confirm = (title: string, body: string, buttons?: Array<{ title: string } | string> = []): Promise<void> => new Promise((resolve, reject) => {
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
        config = { title: config };
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
  });

  toast = (method: string, title: string, body?: string | Object, options?: Object) => {
    if (typeof body === 'object') {
      options = body;
      body = '';
    }
    options = options || {};
    if (options.closeButton !== false) {
      options.closeButton = true;
    }
    if (!options.showAnimation) {
      options.showAnimation = 'animated fadeInRight';
    }
    if (!options.hideAnimation) {
      options.hideAnimation = 'animated fadeOutRight';
    }
    if (!options.timeOut) {
      options.timeOut = 10000;
    }
    if (this.toastContainer) {
      // $Flow
      this.toastContainer[method](title, body, options);
    }
  };

  handleCloseModal = () => {
    this.setState({ modalOpen: false });
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

  renderPage() {
    const { user, settings, views } = this.props;

    let info = [user.access, user.id, settings.locale];
    if (_.isEqual(info, this._pageInfo)) {
      return this._page;
    }

    let el;

    //有权限
    if (user.access) {
      el = <Router>
        <Route
          path=""
          component={(props) => (
            <Manage {...props}>
              <Switch>
                <Route component={Dashboard} exact path="/" />
                <Route component={ListPage} exact path="/list/:service/:model" />
                <Route component={EditorPage} exact path="/edit/:service/:model/:id" />
                {
                  (views.routes || []).map((item) => (
                    <Route key={item.path} component={item.component} exact path={item.path} />))
                }
                <Route component={NotFoundPage} />
              </Switch>
            </Manage>
          )}
        />
      </Router>;
    } else if (user.id) { //已登录,但无权限
      el = <Locked />;
    } else if (settings.locale) { //未登录,已加载设置
      el = <Login />;
    } else {
      el = <div className="boot-loading">Loading...</div>;
    }

    this._page = el;
    this._pageInfo = info;
    return el;
  }

  render() {
    const { layout } = this.props;
    const state = this.state;

    return (<Node id="app" className={layout}>
      {this.renderPage()}
      <ToastContainer
        ref={(r) => {
          this.toastContainer = r;
        }}
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

const Connected = connect(({ user, settings, layout }) => ({
  user,
  settings,
  layout
}), (dispatch) => bindActionCreators({ applyLayout: layoutRedux.applyLayout }, dispatch))(App);

export default DragDropContext(HTML5Backend)(Connected);
