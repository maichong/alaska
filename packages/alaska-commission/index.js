'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class CommissionService extends _alaska.Service {
  constructor(options) {
    options = options || { dir: '', id: '' };
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-commission';
    super(options);
  }

  postLoadConfig() {
    _alaska2.default.main.applyConfig({
      middlewares: {
        promoter: {
          fn: require('./middlewares/promoter').default, // eslint-disable-line global-require
          sort: 0,
          options: {
            queryKey: this.getConfig('queryKey'),
            cookieOptions: this.getConfig('cookieOptions')
          }
        }
      }
    });
  }
}

exports.default = new CommissionService();