import * as _ from 'lodash';
import * as collie from 'collie';
import { Extension, Service, MainService } from 'alaska';
import { nameToKey } from 'alaska/utils';
import { ServiceModules } from 'alaska-modules';
import { Model as ModelType, ModelGenerator } from 'alaska-model';
import Model from './model';
import Field from './field';

export { Model, Field };

function setModelDefaults(model: typeof ModelType, service: Service, name: string) {

  if (!model.service) model.service = service;
  if (!model.modelName) model.modelName = name;
  if (!model.key) model.key = nameToKey(name);
  if (!model.id) model.id = `${service.id}.${name}`;

  _.defaults(model, {
    label: model.modelName,
    titleField: 'title',
    searchFields: '',
    defaultSort: '',
    defaultColumns: '',
    defaultFilters: null,
    schemaOptions: {},
    actions: {},
    groups: {},
    api: {},
    scopes: {},
    _scopes: {},
    _fields: {},
  });

  // 默认分组
  if (!model.groups.default) {
    model.groups.default = {};
  }

  // 自动查询仅仅需要的字段
  if (model.autoSelect !== false) {
    model.autoSelect = true;
  }

  // CURD actions
  if (!model.actions.add) {
    model.actions.add = {};
  }
  _.defaults(model.actions.add, {
    title: 'Create',
    color: 'success',
    // TODO:
    link: '',
    editor: true,
    list: true,
    hidden: 'isNew'
  });

  if (!model.actions.create) {
    model.actions.create = {};
  }
  _.defaults(model.actions.create, {
    title: 'Create',
    color: 'primary',
    sled: 'alaska-admin.Create',
    editor: true,
    // hidden: '_id'  //TODO: 暂时注释，为了方便添加数据进行测试
  });

  if (!model.actions.export) {
    model.actions.export = {};
  }
  _.defaults(model.actions.export, {
    title: 'Export',
    color: 'primary',
    sled: 'alaska-admin.Export',
    list: true
  });

  if (!model.actions.update) {
    model.actions.update = {};
  }
  _.defaults(model.actions.update, {
    title: 'Update',
    color: 'primary',
    sled: 'alaska-admin.Update',
    editor: true,
    hidden: 'isNew'
  });

  if (!model.actions.remove) {
    model.actions.remove = {};
  }
  _.defaults(model.actions.remove, {
    title: 'Remove',
    color: 'danger',
    sled: 'alaska-admin.Remove',
    editor: true,
    list: true,
    needRecords: 1,
    hidden: 'isNew'
  });

}

export default class ModelExtension extends Extension {
  constructor(main: MainService) {
    super(main);

    Model.main = main;

    _.forEach(main.modules.services, (s: ServiceModules) => {
      let service: Service = s.service;
      service.models = {};
      _.forEach(s.models, (model: typeof ModelType, name: string) => {
        service.models[name] = model;

        setModelDefaults(model, service, name);
      });

      // plugins
      _.forEach(s.plugins, (plugin, pluginName) => {
        _.forEach(plugin.models, (settings, name) => {
          if (typeof settings === 'function') {
            if ((settings as typeof ModelType).classOfModel) {
              // Model
              service.models[name] = (settings as typeof ModelType);
            } else {
              // ModelGenerator
              service.models[name] = (settings as ModelGenerator)(service.models[name]);
              if (!service.models[name] || !service.models[name].classOfModel) {
                throw new Error(`Model generator should return a Model class [${pluginName}/models/${name}]`);
              }
              setModelDefaults(service.models[name], service, name);
            }
            return;
          }

          // Model settings
          if (!settings) {
            throw new Error(`Invalid model settings [${pluginName}/models/${name}]`);
          }

          let model: typeof ModelType = service.models[name];
          if (!model) throw new Error(`Can not apply model settings, ${service.id}.${name} not found!`);
          model.applySettings(settings);
        });
      });

      collie(service, 'initModels', async () => {
        service.debug('initModels');
        if (service.models) {
          for (let modelName of Object.keys(service.models)) {
            await service.registerModel(service.models[modelName]);
          }
        }
      });
      collie(service, 'registerModel', async (model: typeof ModelType) => {
        service.debug('registerModel', model.modelName);
        await model.register();
      });

      service.pre('init', async () => {
        await service.initModels();
      });
    });

  }
}
