'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _alaska = require('alaska');

var _alaska2 = _interopRequireDefault(_alaska);

var _Role = require('alaska-user/models/Role');

var _Role2 = _interopRequireDefault(_Role);

var _AdminMenu = require('./models/AdminMenu');

var _AdminMenu2 = _interopRequireDefault(_AdminMenu);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @class AdminService
 */
class AdminService extends _alaska.Service {
  constructor(options) {
    options = options || { dir: '', id: '' };
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-admin';
    super(options);
  }

  async preMount() {
    if (this.getConfig('autoInit')) {
      let services = Object.keys(_alaska2.default.services);
      for (let serviceId of services) {
        let Init = _alaska2.default.getService(serviceId).sleds.Init;
        if (Init) {
          await Init.run();
        }
      }
    }
  }

  /**
   * 获取管理平台前台配置
   * @param {Alaska$Context} ctx
   * @param {User} user
   * @returns {Promise<Object>}
   */
  async settings(ctx, user) {
    let result = {
      superMode: ctx.state.superMode,
      services: {},
      locales: {},
      abilities: {},
      menu: []
    };

    let services = result.services;
    let locales = result.locales;

    for (let serviceId of Object.keys(_alaska2.default.services)) {
      let service = _alaska2.default.services[serviceId];
      let settings = {};
      settings.id = serviceId;
      settings.domain = service.getConfig('domain');
      settings.prefix = service.getConfig('prefix');
      settings.api = service.getConfig('api');
      settings.models = {};
      locales[serviceId] = service.locales;
      for (let modelName of Object.keys(service.models)) {
        let Model = service.models[modelName];
        if (!Model || Model.hidden) {
          continue;
        }
        let model = {
          modelName: Model.modelName,
          label: Model.label,
          id: Model.id,
          path: Model.path,
          key: Model.key,
          preview: Model.preview,
          titleField: Model.titleField,
          defaultSort: Model.defaultSort,
          defaultColumns: Model.defaultColumns,
          nocreate: Model.nocreate,
          noupdate: Model.noupdate,
          noremove: Model.noremove,
          groups: Model.groups,
          relationships: _lodash2.default.reduce(Model.relationships, (res, r, key) => {
            res[key] = {
              key,
              path: r.path,
              title: r.title,
              filters: r.filters,
              service: r.ref.service.id,
              model: r.ref.modelName
            };
            return res;
          }, {}),
          actions: Model.actions || {},
          fields: {},
          searchFields: Model.searchFields || []
        };
        if (!model.defaultColumns) {
          model.defaultColumns = ['_id'];
          if (Model.titleField && Model._fields[Model.titleField]) {
            model.defaultColumns.push(model.titleField);
          }
          if (Model._fields.createdAt) {
            model.defaultColumns.push('createdAt');
          }
        }
        if (typeof model.defaultColumns === 'string') {
          model.defaultColumns = model.defaultColumns.replace(/ /g, '').split(',');
        }
        for (let path of Object.keys(Model._fields)) {
          let field = Model._fields[path];
          let options = field.viewOptions();
          if (options.label === '_ID') {
            options.label = 'ID';
          }
          options.plain = '';
          if (field.type.plain === String) {
            options.plain = 'string';
          } else if (field.type.plain === Date) {
            options.plain = 'date';
          } else if (field.type.plain === Number) {
            options.plain = 'number';
          } else if (field.type.plain === Boolean) {
            options.plain = 'bool';
          } else if (field.type.plain === _mongoose2.default.Schema.Types.ObjectId) {
            options.plain = 'id';
          } else if (field.type.plain === _mongoose2.default.Schema.Types.Mixed) {
            options.plain = 'object';
          } else {
            options.plain = '';
          }
          model.fields[path] = options;
        }
        if (!model.fields._id) {
          model.fields._id = {
            label: 'ID',
            path: '_id',
            cell: 'TextFieldCell',
            plain: 'id'
          };
        }
        settings.models[Model.modelName] = model;
      }
      services[service.id] = settings;
    }

    let abilities = result.abilities;

    function addAbilities(list) {
      if (list) {
        for (let ability of list) {
          if (typeof ability === 'string') {
            abilities[ability] = true;
          } else if (ability._id) {
            abilities[ability._id] = true;
          }
        }
      }
    }

    addAbilities(user.abilities);

    if (user.roles) {
      for (let role of user.roles) {
        if (typeof role === 'string') {
          // $Flow
          role = await _Role2.default.findById(role);
        }
        if (role) {
          addAbilities(role.abilities);
        }
      }
    }

    let menu = [];
    let menuMap = _lodash2.default.reduce((await _AdminMenu2.default.find().sort('-sort')), (res, item) => {
      item = item.data();
      if (item.activated && (!item.ability || abilities[item.ability] || result.superMode)) {
        delete item.ability;
        menu.push(item);
        if (!result.superMode && item.super) {
          item.hidden = true;
        }
      } else {
        item.hidden = true;
      }
      res[item.id] = item;
      return res;
    }, {});

    _lodash2.default.each(menuMap, item => {
      if (!item.hidden && item.parent && menuMap[item.parent]) {
        if (!menuMap[item.parent].subs) {
          menuMap[item.parent].subs = [];
        }
        item.isSub = true;
        menuMap[item.parent].subs.push(item);
      }
    });

    result.menu = _lodash2.default.filter(menu, item => !item.isSub && !item.hidden);

    for (let serviceId of Object.keys(_alaska2.default.services)) {
      let service = _alaska2.default.services[serviceId];
      if (service !== this && service.adminSettings) {
        await service.adminSettings(ctx, user, result);
      }
    }

    return result;
  }
}

exports.default = new AdminService();