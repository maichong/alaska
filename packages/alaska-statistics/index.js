'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.views = undefined;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _alaska = require('alaska');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const views = exports.views = {
  AxisSelector: _path2.default.join(__dirname, '/views/AxisSelector'),
  ChartReview: _path2.default.join(__dirname, '/views/ChartReview'),
  Chart: _path2.default.join(__dirname, '/views/Chart')
};

/**
 * @class StatisticsService
 */


class StatisticsService extends _alaska.Service {
  constructor(options) {
    options = options || { dir: '', id: '' };
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-statistics';
    super(options);
  }

  postLoadModels() {
    let reducers = this.getConfig('reducers');
    if (_lodash2.default.isEmpty(reducers)) return;
    const ChartSource = this.getModel('ChartSource');
    _lodash2.default.forEach(reducers, (reducer, key) => {
      let options = _lodash2.default.omit(reducer, 'fn', 'final');
      options.value = key;
      // $Flow ChartSource.fields.reducer.options flow报错为undefined
      ChartSource.fields.reducer.options.push(options);
    });
  }

  async adminSettings(ctx, user, settings) {
    if (!settings.services['alaska-statistics']) return;
    let options = [];
    _lodash2.default.forEach(settings.services, service => {
      if (service.id === 'alaska-statistics') return;
      _lodash2.default.forEach(service.models, Model => {
        if (Model.hidden) return;
        options.push({ label: Model.label, value: Model.path });
      });
    });
    settings.services['alaska-statistics'].models.ChartSource.fields.model.options = options;
  }

  postMount() {
    setTimeout(() => this.run('AutoBuild'), 5000);
    setInterval(() => this.run('AutoBuild'), 60 * 1000);
  }
}

exports.default = new StatisticsService();