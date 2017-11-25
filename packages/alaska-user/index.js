'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

var _Ability = require('./models/Ability');

var _Ability2 = _interopRequireDefault(_Ability);

var _Role = require('./models/Role');

var _Role2 = _interopRequireDefault(_Role);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @class UserService
 */
class UserService extends _alaska.Service {
  constructor(options) {
    options = options || { dir: '', id: '' };
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-user';
    super(options);
  }

  postInit() {
    let middlewares = _alaska2.default.getConfig('middlewares');
    let newConfigs = {
      middlewares: {
        user: {
          fn: require('./middlewares/user').default, // eslint-disable-line global-require
          sort: 700
        }
      }
    };
    if (!middlewares['alaska-middleware-session']) {
      // $Flow
      newConfigs.middlewares['alaska-middleware-session'] = { // eslint-disable-line
        fn: require('alaska-middleware-session'), // eslint-disable-line
        sort: 800,
        options: _alaska2.default.main.getConfig('session')
      };
    }
    _alaska2.default.main.applyConfig(newConfigs);
  }

  /**
   * 获取所有权限列表
   * @returns {Ability[]}
   */
  async abilities() {
    let { cache } = this;
    let data = await cache.get('abilities_list');
    if (data) {
      // $Flow
      return _Ability2.default.fromObjectArray(data);
    }
    // $Flow
    let records = await _Ability2.default.find().sort('-sort');
    if (records.length) {
      //缓存10分钟
      await cache.set('abilities_list', _Ability2.default.toObjectArray(records), 600 * 1000);
    }
    return records;
  }

  /**
   * 获取角色列表
   * @returns {Role[]}
   */
  async roles() {
    let { cache } = this;
    let data = await cache.get('roles_list');
    if (data) {
      // $Flow
      return _Role2.default.fromObjectArray(data);
    }
    // $Flow
    let roles = await _Role2.default.find().sort('-sort');
    if (roles.length) {
      //缓存10分钟
      await cache.set('abilities_list', _Role2.default.toObjectArray(roles), 600 * 1000);
    }
    return roles;
  }

  /**
   * 清空本模块缓存
   */
  async clearCache() {
    let { cache } = this;
    await cache.del('abilities_list');
    await cache.del('roles_list');
  }
}

exports.default = new UserService();