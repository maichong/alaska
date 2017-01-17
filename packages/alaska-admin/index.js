// @flow

import _ from 'lodash';
import mongoose from 'mongoose';
import alaska, { Service } from 'alaska';
import Role from 'alaska-user/models/Role';
import AdminMenu from './models/AdminMenu';

/**
 * @class AdminService
 */
class AdminService extends Service {
  constructor(options?: Alaska$Service$options) {
    options = options || {};
    options.dir = options.dir || __dirname;
    options.id = options.id || 'alaska-admin';
    super(options);
  }

  postInit() {
    alaska.main.applyConfig({
      '+appMiddlewares': [{
        id: 'koa-bodyparser',
        sort: 1000,
        options: alaska.main.config('koa-bodyparser')
      }, {
        id: 'alaska-middleware-upload',
        sort: 1000,
        options: alaska.main.config('alaska-middleware-upload')
      }]
    });
  }

  async preMount() {
    if (this.config('autoInit')) {
      let services = Object.keys(alaska.services);
      for (let serviceId of services) {
        let Init = alaska.service(serviceId).sleds.Init;
        if (Init) {
          await Init.run();
        }
      }
    }
  }

  /**
   * [async] 获取管理平台前台配置
   * @param {Alaska$Context} ctx
   * @param {User} user
   * @returns {Promise<Object>}
   */
  async settings(ctx: Alaska$Context, user: User): Promise<Object> {
    let result = {
      superMode: ctx.state.superMode,
      services: {},
      locales: {},
      abilities: {},
      menu: []
    };

    let services = result.services;
    let locales = result.locales;

    for (let serviceId of Object.keys(alaska.services)) {
      let service = alaska.services[serviceId];
      let settings = {};
      settings.id = serviceId;
      settings.domain = service.config('domain');
      settings.prefix = service.config('prefix');
      settings.api = service.config('api');
      settings.models = {};
      locales[serviceId] = service.locales;
      for (let modelName of Object.keys(service.models)) {
        let Model = service.models[modelName];
        if (!Model || Model.hidden) {
          continue;
        }
        let model = {
          name: Model.name,
          id: Model.id,
          path: Model.path,
          key: Model.key,
          titleField: Model.titleField,
          defaultSort: Model.defaultSort,
          defaultColumns: Model.defaultColumns,
          nocreate: Model.nocreate,
          noedit: Model.noedit,
          noremove: Model.noremove,
          groups: Model.groups,
          relationships: _.reduce(Model.relationships, (res, r, key) => {
            res[key] = {
              key,
              path: r.path,
              title: r.title,
              filters: r.filters,
              service: r.ref.service.id,
              model: r.ref.name
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
          let field: Alaska$Field = Model._fields[path];
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
          } else if (field.type.plain === mongoose.Schema.Types.ObjectId) {
            options.plain = 'id';
          } else if (field.type.plain === mongoose.Schema.Types.Mixed) {
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
        settings.models[Model.name] = model;
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
          role = await Role.findById(role);
        }
        if (role) {
          addAbilities(role.abilities);
        }
      }
    }

    let menu = [];
    let menuMap = _.reduce(await AdminMenu.find().sort('-sort'), (res, item) => {
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

    _.each(menuMap, (item) => {
      if (!item.hidden && item.parent && menuMap[item.parent]) {
        if (!menuMap[item.parent].subs) {
          menuMap[item.parent].subs = [];
        }
        item.isSub = true;
        menuMap[item.parent].subs.push(item);
      }
    });

    result.menu = _.filter(menu, (item) => !item.isSub && !item.hidden);

    for (let serviceId of Object.keys(alaska.services)) {
      let service = alaska.services[serviceId];
      if (service !== this && service.adminSettings) {
        await service.adminSettings(ctx, user, result);
      }
    }

    return result;
  }
}

export default new AdminService();
