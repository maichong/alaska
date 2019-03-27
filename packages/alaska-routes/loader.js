"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const Path = require("path");
const fs = require("fs");
const isDirectory = require("is-directory");
const alaska_1 = require("alaska");
const tree_1 = require("alaska-modules/tree");
const debug_1 = require("./debug");
class RoutesLoader extends alaska_1.Loader {
    constructor(metadata, extConfig) {
        super(metadata, extConfig);
        metadata.post('loadService', async (res, meta) => {
            debug_1.default(`${meta.id} load routes`);
            let routes = {};
            meta.routes = routes;
            let routesDir = Path.join(meta.path, 'routes');
            if (!fs.existsSync(routesDir))
                return;
            let names = fs.readdirSync(routesDir);
            for (let name of names) {
                if (name[0] === '.')
                    continue;
                if (/\.[tj]sx?$/.test(name)) {
                    name = name.replace(/\.[tj]sx?$/, '');
                    routes[name] = Path.join(routesDir, name);
                }
                else if (isDirectory.sync(Path.join(routesDir, name))) {
                    routes[name] = Path.join(routesDir, name, 'index');
                }
            }
        });
        metadata.post('loadServicePlugin', async (res, service, plugin) => {
            if (plugin.dismiss)
                return;
            let routesDir = Path.join(plugin.path, 'routes');
            if (!isDirectory.sync(routesDir))
                return;
            let routes = {};
            plugin.routes = routes;
            let names = fs.readdirSync(routesDir);
            for (let name of names) {
                if (name[0] === '.')
                    continue;
                if (/\.[tj]sx?$/.test(name)) {
                    name = name.replace(/\.[tj]sx?$/, '');
                    routes[name] = Path.join(routesDir, name);
                }
                else if (isDirectory.sync(Path.join(routesDir, name))) {
                    routes[name] = Path.join(routesDir, name, 'index');
                }
            }
        });
        metadata.post('buildService', async (res, meta, tree) => {
            debug_1.default(`${meta.id} build routes`);
            let routes = new tree_1.ModuleTree();
            tree.services[meta.id].routes = routes;
            _.forEach(meta.routes, (path, name) => {
                routes[name] = new tree_1.Module(path, 'ESModule');
            });
        });
        metadata.post('buildPlugin', async (res, service, tree, pluginMeta, plugin) => {
            if (!pluginMeta.routes)
                return;
            let routes = new tree_1.ModuleTree();
            plugin.routes = routes;
            _.forEach(pluginMeta.routes, (path, name) => {
                routes[name] = new tree_1.Module(path, 'ESModule');
            });
        });
    }
}
exports.default = RoutesLoader;
