"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const collie = require("collie");
const alaska_1 = require("alaska");
const utils_1 = require("alaska/utils");
const model_1 = require("./model");
exports.Model = model_1.default;
const field_1 = require("./field");
exports.Field = field_1.default;
function setModelDefaults(model, service, name) {
    if (!model.service)
        model.service = service;
    if (!model.modelName)
        model.modelName = name;
    if (!model.key)
        model.key = utils_1.nameToKey(name);
    if (!model.id)
        model.id = `${service.id}.${name}`;
    _.defaults(model, {
        label: model.modelName,
        titleField: 'title',
        searchFields: '',
        filterFields: '',
        defaultSort: '',
        defaultColumns: '',
        defaultFilters: null,
        listLimit: 100,
        schemaOptions: {},
        actions: {},
        groups: {},
        api: {},
        scopes: {},
        _scopes: {},
        _fields: {},
    });
    if (!model.groups.default) {
        model.groups.default = {};
    }
    if (model.autoSelect !== false) {
        model.autoSelect = true;
    }
    if (!model.actions.add) {
        model.actions.add = {};
    }
    _.defaults(model.actions.add, {
        title: 'Create',
        color: 'success',
        link: '',
        ability: `${model.id}.create`,
        pages: ['editor', 'list'],
        hidden: 'isNew'
    });
    if (!model.actions.create) {
        model.actions.create = {};
    }
    _.defaults(model.actions.create, {
        title: 'Create',
        color: 'primary',
        sled: 'alaska-admin.Create',
    });
    if (!model.actions.export) {
        model.actions.export = {};
    }
    _.defaults(model.actions.export, {
        title: 'Export',
        color: 'primary',
        sled: 'alaska-admin.Export',
        pages: ['list'],
    });
    if (!model.actions.update) {
        model.actions.update = {};
    }
    _.defaults(model.actions.update, {
        title: 'Update',
        color: 'primary',
        sled: 'alaska-admin.Update',
        hidden: 'isNew'
    });
    if (!model.actions.remove) {
        model.actions.remove = {};
    }
    _.defaults(model.actions.remove, {
        title: 'Remove',
        color: 'danger',
        sled: 'alaska-admin.Remove',
        pages: ['editor', 'list'],
        needRecords: 1,
        hidden: 'isNew'
    });
}
class ModelExtension extends alaska_1.Extension {
    constructor(main) {
        super(main);
        model_1.default.main = main;
        _.forEach(main.modules.services, (s) => {
            let service = s.service;
            service.models = {};
            _.forEach(s.models, (model, name) => {
                service.models[name] = model;
                setModelDefaults(model, service, name);
            });
            _.forEach(s.plugins, (plugin, pluginName) => {
                _.forEach(plugin.models, (settings, name) => {
                    if (typeof settings === 'function') {
                        if (settings.classOfModel) {
                            service.models[name] = settings;
                        }
                        else {
                            service.models[name] = settings(service.models[name]);
                            if (!service.models[name] || !service.models[name].classOfModel) {
                                throw new Error(`Model generator should return a Model class [${pluginName}/models/${name}]`);
                            }
                            setModelDefaults(service.models[name], service, name);
                        }
                        return;
                    }
                    if (!settings) {
                        throw new Error(`Invalid model settings [${pluginName}/models/${name}]`);
                    }
                    let model = service.models[name];
                    if (!model)
                        throw new Error(`Can not apply model settings, ${service.id}.${name} not found!`);
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
            collie(service, 'registerModel', async (model) => {
                service.debug('registerModel', model.modelName);
                await model.register();
            });
            service.pre('init', async () => {
                await service.initModels();
            });
        });
    }
}
exports.default = ModelExtension;
