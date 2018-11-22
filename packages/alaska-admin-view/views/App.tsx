import * as React from 'react';
import * as PropTypes from 'prop-types';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { AppProps, State, Settings, Layout } from 'alaska-admin-view';
import ModalBus, { alert, confirm } from '@samoyed/modal';
import { ToastContainer } from '@samoyed/toast';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as layoutRedux from '../redux/layout';
import LoadingPage from './LoadingPage';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import DeniedPage from './DeniedPage';
import Node from './Node';

interface AppState {

}

interface Props extends AppProps {
  settings: Settings;
  layout: Layout;
  applyLayout: Function;
}

class App extends React.Component<Props, AppState> {

  static childContextTypes = {
    views: PropTypes.object
  };

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  getChildContext() {
    return {
      views: this.props.views
    };
  }

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
    const { settings } = this.props;
    // //加载
    if (!settings || !settings.copyright) {
      return <LoadingPage />;
    }
    //未登录
    if (!settings.user || !settings.user.id) {
      return <LoginPage />;
    }
    //权限
    if (!settings.authorized) {
      return <DeniedPage />;
    }
    //首页
    return <Dashboard />;
  }

  render() {
    const { layout } = this.props;
    return (
      <Node
        className={`app ${layout}`}
        wrapper="App"
        props={this.props}
      >
        <Router>
          <div className="alaska-app">
            {
              this.renderPage()
            }
          </div>
        </Router>
        <ToastContainer
          className="toast-top-right"
        />
        <ModalBus />
      </Node>
    );
  }
}

// Selects which state properties are merged into the component's props
export default connect(
  (state: State) => ({ settings: state.settings, layout: state.layout }),
  (dispatch) => bindActionCreators({ applyLayout: layoutRedux.applyLayout }, dispatch)
)(App);
