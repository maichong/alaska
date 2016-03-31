'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _util = require('../util');

var util = _interopRequireWildcard(_util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @copyright Maichong Software Ltd. 2016 http://maichong.it
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @date 2016-02-28
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @author Liang <liang@maichong.it>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */

exports.default = (() => {
  var ref = _asyncToGenerator(function* () {
    this.debug('%s init', this.id);
    this.init = util.noop;

    //加载扩展配置
    for (let dir of this._configDirs) {
      let configFile = dir + '.js';
      if (util.isFile(configFile)) {
        this.applyConfig(require(configFile).default);
      }
      configFile = dir + '/config.js';
      if (util.isFile(configFile)) {
        this.applyConfig(require(configFile).default);
      }
    }

    //数据库collection前缀
    let dbPrefix = this.config('dbPrefix');
    if (dbPrefix === false) {
      this.dbPrefix = '';
    } else if (typeof dbPrefix === 'string') {
      this.dbPrefix = dbPrefix;
    } else {
      this.dbPrefix = this.id.replace('alaska-', '') + '_';
    }

    let services = this.config('services') || [];
    if (typeof services === 'string') {
      services = [services];
    }

    for (let service of services) {
      if (typeof service === 'string') {
        service = { id: service };
      }
      let serviceId = service.id;
      let serviceAlias = service.alias;
      (0, _assert2.default)(typeof serviceId === 'string', 'Sub service id should be string.');
      let sub = this.alaska.service(serviceId);
      this._services.push(sub);
      (0, _assert2.default)(!this._alias[serviceId], 'Service alias is exists.');
      this._alias[serviceId] = sub;
      if (serviceAlias) {
        (0, _assert2.default)(!this._alias[serviceAlias], 'Service alias is exists.');
        this._alias[serviceAlias] = sub;
      }
      let configDir = this.dir + '/config/' + serviceId;
      sub._configDirs.push(configDir);
      yield sub.init();
    }
  });

  function init() {
    return ref.apply(this, arguments);
  }

  return init;
})();