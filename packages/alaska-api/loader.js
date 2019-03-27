"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const Path = require("path");
const fs = require("fs");
const isDirectory = require("is-directory");
const alaska_1 = require("alaska");
const tree_1 = require("alaska-modules/tree");
const debug_1 = require("./debug");
class ApiLoader extends alaska_1.Loader {
    constructor(metadata, extConfig) {
        super(metadata, extConfig);
        metadata.post('loadService', async (res, meta) => {
            debug_1.default(`${meta.id} load api`);
            let api = {};
            meta.api = api;
            let apiDir = Path.join(meta.path, 'api');
            if (!fs.existsSync(apiDir))
                return;
            let names = fs.readdirSync(apiDir);
            for (let name of names) {
                if (name[0] === '.')
                    continue;
                if (/\.[tj]sx?$/.test(name)) {
                    name = name.replace(/\.[tj]sx?$/, '');
                    api[name] = Path.join(apiDir, name);
                }
            }
        });
        metadata.post('loadServicePlugin', async (res, service, plugin) => {
            if (plugin.dismiss)
                return;
            let apiDir = Path.join(plugin.path, 'api');
            if (!isDirectory.sync(apiDir))
                return;
            let api = {};
            plugin.api = api;
            let names = fs.readdirSync(apiDir);
            for (let name of names) {
                if (name[0] === '.')
                    continue;
                if (/\.[tj]sx?$/.test(name)) {
                    name = name.replace(/\.[tj]sx?$/, '');
                    api[name] = Path.join(apiDir, name);
                }
                else if (isDirectory.sync(Path.join(apiDir, name))) {
                    api[name] = Path.join(apiDir, name, 'index');
                }
            }
        });
        metadata.post('buildService', async (res, meta, tree) => {
            debug_1.default(`${meta.id} build api`);
            let api = new tree_1.ModuleTree();
            tree.services[meta.id].api = api;
            _.forEach(meta.api, (path, name) => {
                api[name] = new tree_1.Module(path, 'CommonJs');
            });
        });
        metadata.post('buildPlugin', async (res, service, tree, pluginMeta, plugin) => {
            if (!pluginMeta.api)
                return;
            let api = new tree_1.ModuleTree();
            plugin.api = api;
            _.forEach(pluginMeta.api, (path, name) => {
                api[name] = new tree_1.Module(path, 'CommonJs');
            });
        });
    }
}
exports.default = ApiLoader;
