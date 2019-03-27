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
            debug_1.default(`${meta.id} load sleds`);
            let sleds = {};
            meta.sleds = sleds;
            let sledsDir = Path.join(meta.path, 'sleds');
            if (!fs.existsSync(sledsDir))
                return;
            let names = fs.readdirSync(sledsDir);
            for (let name of names) {
                if (name[0] === '.' || !/\.[tj]sx?$/.test(name) || name.endsWith('.d.ts'))
                    continue;
                name = name.replace(/\.[tj]sx?$/, '');
                sleds[name] = Path.join(sledsDir, name);
            }
        });
        metadata.post('loadServicePlugin', async (res, service, plugin) => {
            if (plugin.dismiss)
                return;
            let sledsDir = Path.join(plugin.path, 'sleds');
            if (!isDirectory.sync(sledsDir))
                return;
            let sleds = {};
            plugin.sleds = sleds;
            let names = fs.readdirSync(sledsDir);
            for (let name of names) {
                if (name[0] === '.')
                    continue;
                if (/\.[tj]sx?$/.test(name)) {
                    name = name.replace(/\.[tj]sx?$/, '');
                    sleds[name] = Path.join(sledsDir, name);
                }
            }
        });
        metadata.post('buildService', async (res, meta, tree) => {
            debug_1.default(`${meta.id} build sleds`);
            let sleds = new tree_1.ModuleTree();
            tree.services[meta.id].sleds = sleds;
            _.forEach(meta.sleds, (path, name) => {
                sleds[name] = new tree_1.Module(path, 'ESModule');
            });
        });
        metadata.post('buildPlugin', async (res, service, tree, pluginMeta, plugin) => {
            if (!pluginMeta.sleds)
                return;
            let sleds = new tree_1.ModuleTree();
            plugin.sleds = sleds;
            _.forEach(pluginMeta.sleds, (path, name) => {
                sleds[name] = new tree_1.Module(path, 'ESModule');
            });
        });
    }
}
exports.default = ModelLoader;
