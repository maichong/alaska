'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

var _alaskaSettings = require('alaska-settings');

var _alaskaSettings2 = _interopRequireDefault(_alaskaSettings);

var _alaskaUser = require('alaska-user');

var _alaskaUser2 = _interopRequireDefault(_alaskaUser);

var _Ability = require('alaska-user/models/Ability');

var _Ability2 = _interopRequireDefault(_Ability);

var _RegisterMenu = require('./RegisterMenu');

var _RegisterMenu2 = _interopRequireDefault(_RegisterMenu);

var _AdminMenu = require('../models/AdminMenu');

var _AdminMenu2 = _interopRequireDefault(_AdminMenu);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 自动已经系统中所有的模型,注册管理员后台菜单
 */
class Init extends _alaska.Sled {
  async exec() {
    _RegisterMenu2.default.run({
      id: 'admin.settings',
      label: 'Settings',
      icon: 'cogs',
      type: 'link',
      link: '/settings',
      ability: ['admin.alaska-settings.settings.update'],
      service: 'alaska-settings',
      activated: true
    });

    _alaskaSettings2.default.register({
      id: 'adminLogo',
      title: 'Admin Logo',
      service: 'alaska-admin',
      type: 'ImageFieldView'
    });

    _alaskaSettings2.default.register({
      id: 'adminLoginLogo',
      title: 'Admin Login Logo',
      service: 'alaska-admin',
      type: 'ImageFieldView'
    });

    _alaskaSettings2.default.register({
      id: 'adminIcon',
      title: 'Admin Icon',
      service: 'alaska-admin',
      type: 'ImageFieldView'
    });

    _alaskaUser2.default.run('RegisterAbility', {
      id: 'admin',
      title: 'Admin login',
      service: 'alaska-admin'
    });
    await _alaskaUser2.default.run('RegisterRole', {
      id: 'admin',
      title: 'Admin',
      abilities: ['admin']
    });
    const root = await _alaskaUser2.default.run('RegisterRole', {
      id: 'root',
      title: 'Root',
      abilities: ['admin']
    });

    const rootAbilities = _lodash2.default.clone(root.abilities);

    // $Flow
    let menus = _lodash2.default.reduce((await _AdminMenu2.default.find()), (res, menu) => {
      res[menu.id] = menu;
      return res;
    }, {});

    let abilities = (await _Ability2.default.find()).reduce((map, record) => {
      map[record._id] = record;
      return map;
    }, {});

    for (let serviceId of Object.keys(_alaska2.default.services)) {
      let ser = _alaska2.default.services[serviceId];
      for (let modelName of Object.keys(ser.models)) {
        let Model = ser.models[modelName];
        let ability = `admin.${Model.key}.`.toLowerCase();

        function registerAbility(action) {
          if (action === 'add') return; // add Action 使用 create权限
          let id = ability + action;
          if (abilities[id]) return;
          _alaskaUser2.default.run('RegisterAbility', {
            id,
            title: `${action} ${Model.modelName}`,
            service: 'alaska-admin'
          });
          if (rootAbilities.indexOf(id) < 0) {
            rootAbilities.push(id);
          }
        }

        ['read', 'create', 'remove', 'update', 'export'].forEach(registerAbility);
        _lodash2.default.keys(Model.actions).forEach(registerAbility);
        if (Model.hidden) {
          continue;
        }
        let id = `model.${Model.key}`.toLowerCase();
        if (menus[id]) {
          continue;
        }
        _RegisterMenu2.default.run({
          id,
          label: Model.label,
          icon: Model.icon,
          type: 'link',
          link: `/list/${ser.id}/${Model.modelName}`,
          ability: [ability + 'read'],
          service: serviceId,
          activated: true
        }).catch(e => console.error(e.stack));
      }
    }
    if (!_lodash2.default.isEqual(root.abilities, rootAbilities)) {
      root.abilities = rootAbilities;
      await root.save();
    }
  }
}
exports.default = Init;

/* eslint no-inner-declarations:0 */