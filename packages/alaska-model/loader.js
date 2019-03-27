"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const Path = require("path");
const fs = require("fs");
const isDirectory = require("is-directory");
const alaska_1 = require("alaska");
const tree_1 = require("alaska-modules/tree");
const debug_1 = require("./debug");
class ModelLoader extends alaska_1.Loader {
    constructor(metadata, extConfig) {
        super(metadata, extConfig);
        metadata.post('loadService', async (res, meta) => {
            debug_1.default(`${meta.id} load models`);
            let models = {};
            meta.models = models;
            let modelsDir = Path.join(meta.path, 'models');
            if (!fs.existsSync(modelsDir))
                return;
            let names = fs.readdirSync(modelsDir);
            for (let name of names) {
                if (name[0] === '.' || !/\.[tj]sx?$/.test(name) || name.endsWith('.d.ts'))
                    continue;
                name = name.replace(/\.[tj]sx?$/, '');
                models[name] = Path.join(modelsDir, name);
            }
        });
        metadata.post('loadServicePlugin', async (res, service, plugin) => {
            if (plugin.dismiss)
                return;
            let modelsDir = Path.join(plugin.path, 'models');
            if (!isDirectory.sync(modelsDir))
                return;
            let models = {};
            plugin.models = models;
            let names = fs.readdirSync(modelsDir);
            for (let name of names) {
                if (name[0] === '.')
                    continue;
                if (/\.[tj]sx?$/.test(name)) {
                    name = name.replace(/\.[tj]sx?$/, '');
                    models[name] = Path.join(modelsDir, name);
                }
            }
        });
        metadata.post('buildService', async (res, meta, tree) => {
            debug_1.default(`${meta.id} build models`);
            let models = new tree_1.ModuleTree();
            tree.services[meta.id].models = models;
            _.forEach(meta.models, (path, name) => {
                models[name] = new tree_1.Module(path, 'ESModule');
            });
        });
        metadata.post('buildPlugin', async (res, service, tree, pluginMeta, plugin) => {
            if (!pluginMeta.models)
                return;
            let models = new tree_1.ModuleTree();
            plugin.models = models;
            _.forEach(pluginMeta.models, (path, name) => {
                models[name] = new tree_1.Module(path, 'ESModule');
            });
        });
    }
}
exports.default = ModelLoader;
