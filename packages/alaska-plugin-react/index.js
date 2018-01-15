'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _server = require('react-dom/server');

var _server2 = _interopRequireDefault(_server);

var _reactRedux = require('react-redux');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ReactPlugin {

  constructor(service) {
    this.init(service);
  }

  init(service) {
    this.service = service;
    this.label = 'React';

    service.pre('loadRoutes', () => {
      let { router } = service;
      router.use((ctx, next) => {
        function react(view, props = {}) {
          let mod = _alaska2.default.modules.services[service.id];
          if (!mod || !mod.reactViews || !mod.reactViews[view]) {
            service.panic(`React view "${view}" not found!`);
          }
          let View = mod.reactViews[view];
          let element = _react2.default.createElement(View, Object.assign({ isSSR: true }, props));
          if (props.store) {
            element = _react2.default.createElement(_reactRedux.Provider, { store: props.store }, element);
          }
          return _server2.default.renderToStaticMarkup(element);
        }

        ctx.react = react;
        ctx.state.react = react;
        return next();
      });
    });
  }
}
exports.default = ReactPlugin;