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
            debug_1.default(`${meta.id} load locales`);
            let locales = {};
            meta.locales = locales;
            let localesDir = Path.join(meta.path, 'locales');
            if (!fs.existsSync(localesDir))
                return;
            let names = fs.readdirSync(localesDir);
            for (let name of names) {
                if (name[0] === '.' || !/\.[tj]sx?$/.test(name) || name.endsWith('.d.ts'))
                    continue;
                name = name.replace(/\.[tj]sx?$/, '');
                locales[name] = Path.join(localesDir, name);
            }
        });
        metadata.post('loadServicePlugin', async (res, service, plugin) => {
            if (plugin.dismiss)
                return;
            let localesDir = Path.join(plugin.path, 'locales');
            if (!isDirectory.sync(localesDir))
                return;
            let locales = {};
            plugin.locales = locales;
            let names = fs.readdirSync(localesDir);
            for (let name of names) {
                if (name[0] === '.')
                    continue;
                if (/\.[tj]sx?$/.test(name)) {
                    name = name.replace(/\.[tj]sx?$/, '');
                    locales[name] = Path.join(localesDir, name);
                }
            }
        });
        metadata.post('buildService', async (res, meta, tree) => {
            debug_1.default(`${meta.id} build locales`);
            let allowedLocales = metadata.config.locales || [];
            let locales = new tree_1.ModuleTree();
            tree.services[meta.id].locales = locales;
            _.forEach(meta.locales, (path, name) => {
                if (allowedLocales.indexOf(name) === -1)
                    return;
                locales[name] = new tree_1.Module(path, 'ESModule');
            });
        });
        metadata.post('buildPlugin', async (res, service, tree, pluginMeta, plugin) => {
            if (!pluginMeta.locales)
                return;
            let locales = new tree_1.ModuleTree();
            plugin.locales = locales;
            _.forEach(pluginMeta.locales, (path, name) => {
                locales[name] = new tree_1.Module(path, 'ESModule');
            });
        });
    }
}
exports.default = ModelLoader;
