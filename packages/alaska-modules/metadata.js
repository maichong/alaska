"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const collie = require("collie");
const fs = require("fs");
const Path = require("path");
const slash = require("slash");
const isDirectory = require("is-directory");
const alaska_1 = require("alaska");
const tree_1 = require("./tree");
const debug_1 = require("./debug");
function pathJoin(...paths) {
    return slash(Path.join(...paths));
}
function pathResolve(...pathSegments) {
    return slash(Path.resolve(...pathSegments));
}
function pathRelative(from, to) {
    return slash(Path.relative(from, to));
}
function createMetadata(id, dir, configFileName, modulesDirs) {
    debug_1.default('createMetadata');
    const metadata = new ModulesMetadata(id, dir, configFileName, modulesDirs);
    return metadata;
}
exports.default = createMetadata;
class ModulesMetadata {
    constructor(id, dir, configFileName, modulesDirs) {
        this.id = id;
        this.dir = dir;
        this.configFileName = configFileName;
        this.modulesDirs = modulesDirs || ['node_modules'];
        this.config = _.cloneDeep(alaska_1.Config.defaultConfig);
        this.libraries = new Map();
        this.extensions = new Map();
        this.services = new Map();
        this.allServices = new Set();
        this.main = {
            id,
            path: '',
            configFile: pathJoin(dir, 'config', configFileName),
            config: this.config,
            loadConfig: { dir },
            dismiss: false,
            plugins: {}
        };
        collie(this, 'load');
        collie(this, 'loadConfig');
        collie(this, 'loadExtensions');
        collie(this, 'loadExtension');
        collie(this, 'loadServices');
        collie(this, 'loadService');
        collie(this, 'loadPlugins');
        collie(this, 'loadSubServicePlugins');
        collie(this, 'loadServiceConfigPlugins');
        collie(this, 'loadServicePlugin');
        collie(this, 'loadLibraries');
        collie(this, 'loadLibrary');
        collie(this, 'build');
        collie(this, 'buildExtension');
        collie(this, 'buildService');
        collie(this, 'buildPlugin');
        collie(this, 'buildLibrary');
    }
    getRelativePath(path) {
        let cwd = process.cwd();
        let nodeModulesDir = pathJoin(cwd, 'node_modules');
        let p = slash(pathRelative(nodeModulesDir, path));
        if (p[0] !== '.') {
            return p;
        }
        p = slash(pathRelative(this.dir, path));
        if (p[0] !== '.') {
            p = `./${p}`;
        }
        return p;
    }
    async load() {
        debug_1.default('load');
        await this.loadConfig();
        await this.loadExtensions();
        await this.loadServices();
        await this.loadPlugins();
        await this.loadLibraries();
    }
    async loadConfig() {
        debug_1.default('loadConfig');
        let configFile = pathJoin(this.dir, 'config', this.configFileName);
        alaska_1.Config.applyData(this.config, require(configFile).default);
    }
    async loadExtensions() {
        debug_1.default('loadExtensions');
        for (let extId of _.keys(this.config.extensions)) {
            let extConfig = this.config.extensions[extId];
            let meta = {
                id: extId,
                path: '',
                loader: null,
                dismiss: false
            };
            await this.loadExtension(meta, extConfig);
        }
    }
    async loadExtension(meta, extConfig) {
        if (meta.dismiss) {
            return;
        }
        if (!_.find(this.modulesDirs.concat([this.configFileName]), (mDir) => {
            let path = pathJoin(process.cwd(), mDir, meta.id);
            if (!isDirectory.sync(path))
                return false;
            meta.path = path;
            return true;
        })) {
            throw new Error(`Can not load extension ${meta.id}`);
        }
        this.extensions.set(meta.id, meta);
        debug_1.default(`extension create loader: ${meta.id}`);
        const Loader = require(pathJoin(meta.path, 'loader')).default;
        meta.loader = new Loader(this, extConfig);
    }
    async loadServices() {
        debug_1.default('loadServices');
        _.forEach(this.config.services, (loadConfig, sid) => {
            this.allServices.add(sid);
        });
        await this.loadService(this.main);
    }
    async loadService(meta) {
        if (meta.dismiss) {
            return;
        }
        debug_1.default(`load service: ${meta.id}`);
        if (!meta.path) {
            if (meta.loadConfig.dir) {
                if (Path.isAbsolute(meta.loadConfig.dir)) {
                    meta.path = meta.loadConfig.dir;
                }
                else {
                    meta.path = pathJoin(this.dir, 'config', meta.loadConfig.dir);
                }
            }
            else {
                _.find(this.modulesDirs, (dir) => {
                    let path = pathJoin(process.cwd(), dir, meta.id);
                    if (!isDirectory.sync(path))
                        return false;
                    meta.path = path;
                    return true;
                });
            }
        }
        if (!meta.path)
            throw new Error(`Service not found: ${meta.id}`);
        if (!isDirectory.sync(meta.path))
            throw new Error(`Service not exists: ${meta.id}, ${meta.path}`);
        if (!meta.configFile) {
            meta.configFile = pathJoin(meta.path, 'config', meta.id);
        }
        if (!meta.config) {
            let config = require(meta.configFile).default;
            debug_1.default(`${meta.id} base config`, config);
            meta.config = alaska_1.Config.applyData(_.cloneDeep(alaska_1.Config.defaultConfig), config);
        }
        this.services.set(meta.id, meta);
        let loaderFile = pathJoin(meta.path, 'loader');
        if (fs.existsSync(`${loaderFile}.ts`) || fs.existsSync(`${loaderFile}.js`)) {
            debug_1.default(`service create loader: ${meta.id}`);
            const Loader = require(loaderFile).default;
            meta.loader = new Loader(this, {});
        }
        _.forEach(meta.config.services, (loadConfig, sid) => {
            if (loadConfig.optional)
                return;
            this.allServices.add(sid);
        });
        for (let sid of _.keys(meta.config.services)) {
            if (this.services.has(sid))
                continue;
            let sConfig = meta.config.services[sid];
            if (sConfig.optional && !this.allServices.has(sid))
                continue;
            await this.loadService({
                id: sid,
                path: '',
                configFile: '',
                config: null,
                loadConfig: sConfig,
                dismiss: false,
                plugins: {}
            });
        }
    }
    async loadPlugins() {
        debug_1.default('loadPlugins');
        await this.loadSubServicePlugins(this.main);
        await this.loadServiceConfigPlugins(this.main);
    }
    async loadSubServicePlugins(service) {
        debug_1.default('loadSubServicePlugins', service.id);
        if (!service.config.services)
            return;
        for (let sid of _.keys(service.config.services)) {
            let sub = this.services.get(sid);
            if (!sub || sub.dismiss)
                continue;
            if (sub.loadedSubServicePlugins)
                continue;
            sub.loadedSubServicePlugins = true;
            await this.loadSubServicePlugins(sub);
        }
        for (let sid of _.keys(service.config.services)) {
            let sub = this.services.get(sid);
            if (!sub || sub.dismiss)
                continue;
            let pluginDir = pathJoin(service.path, 'plugins', sub.id);
            if (!isDirectory.sync(pluginDir))
                continue;
            let id = service.id;
            if (sub.plugins[id])
                continue;
            let meta = {
                id,
                path: pluginDir,
                dismiss: false
            };
            await this.loadServicePlugin(sub, meta);
            if (!meta.dismiss) {
                sub.plugins[id] = meta;
            }
        }
        if (process.env.NODE_ENV === 'development') {
            let pluginsDir = pathJoin(service.path, 'plugins');
            if (!isDirectory.sync(pluginsDir))
                return;
            fs.readdirSync(pluginsDir).forEach((name) => {
                if (name[0] === '.')
                    return;
                if (service.config.services[name])
                    return;
                console.warn(`WARN: Sub service not found for plugin ${pathRelative(process.cwd(), pathJoin(pluginsDir, name))}`);
            });
        }
    }
    async loadServiceConfigPlugins(service) {
        debug_1.default('loadServiceConfigPlugins', service.id);
        if (service.config.services) {
            for (let sid of _.keys(service.config.services)) {
                let sub = this.services.get(sid);
                if (!sub || sub.dismiss)
                    continue;
                if (sub.loadedServiceConfigPlugins)
                    continue;
                sub.loadedServiceConfigPlugins = true;
                await this.loadServiceConfigPlugins(sub);
            }
        }
        for (let key of _.keys(service.config.plugins)) {
            let pluginConfig = service.config.plugins[key];
            let dir = pluginConfig.dir;
            if (dir) {
                dir = pathJoin(service.path, 'config', dir);
            }
            else {
                _.find(this.modulesDirs, (mDir) => {
                    let path = pathJoin(process.cwd(), mDir, key);
                    if (isDirectory.sync(path)) {
                        dir = path;
                        return true;
                    }
                    return false;
                });
            }
            if (!dir) {
                throw new Error(`Can not find plugin "${key}" for service “${service.id}”`);
            }
            let id = key;
            if (key[0] === '.') {
                id = this.getRelativePath(dir);
            }
            if (service.plugins[id])
                continue;
            let meta = {
                id,
                path: dir,
                dismiss: false
            };
            await this.loadServicePlugin(service, meta);
            if (!meta.dismiss) {
                service.plugins[id] = meta;
            }
        }
    }
    async loadServicePlugin(service, plugin) {
        debug_1.default('loadServicePlugin', service.id, plugin.path + (plugin.dismiss ? ' dismissed' : ''));
        if (plugin.dismiss)
            return;
        if (!plugin.plugin) {
            let files = fs.readdirSync(plugin.path);
            if (files.indexOf('index.js') > -1 || files.indexOf('index.ts') > -1) {
                plugin.plugin = plugin.path;
            }
        }
        if (!plugin.configFile) {
            let configPath = pathJoin(plugin.path, 'config');
            try {
                let config = require(configPath).default;
                plugin.configFile = configPath;
                plugin.config = config;
                alaska_1.Config.applyData(service.config, config);
            }
            catch (e) {
            }
        }
    }
    async loadLibraries() {
        debug_1.default('loadLibraries');
        let libraries = this.config.libraries || [];
        for (let mDir of this.modulesDirs) {
            for (let lib of fs.readdirSync(mDir)) {
                if (lib[0] === '.')
                    continue;
                if (libraries.indexOf(lib) > -1) {
                    let meta = {
                        id: lib,
                        path: pathJoin(process.cwd(), mDir, lib),
                        type: '',
                        dismiss: false
                    };
                    await this.loadLibrary(meta);
                    continue;
                }
                try {
                    let pkgPath = pathJoin(mDir, lib, 'package.json');
                    let content = fs.readFileSync(pkgPath, 'utf8');
                    let json = JSON.parse(content);
                    if (json.alaska && ['core', 'extension', 'service', 'view', 'cli'].indexOf(json.alaska) === -1) {
                        let meta = {
                            id: lib,
                            path: pathJoin(process.cwd(), mDir, lib),
                            type: json.alaska,
                            dismiss: false
                        };
                        await this.loadLibrary(meta);
                    }
                }
                catch (e) { }
            }
        }
    }
    async loadLibrary(meta) {
        if (meta.dismiss)
            return;
        debug_1.default('loadLibrary', meta.id);
        this.libraries.set(meta.id, meta);
    }
    async build() {
        debug_1.default('build');
        let tree = new tree_1.ModuleTree();
        tree.id = this.id;
        tree.libraries = new tree_1.ModuleTree();
        tree.extensions = new tree_1.ModuleTree();
        tree.services = new tree_1.ModuleTree();
        for (let meta of this.libraries.values()) {
            if (meta.dismiss)
                continue;
            await this.buildLibrary(meta, tree);
        }
        for (let meta of this.extensions.values()) {
            if (meta.dismiss)
                continue;
            await this.buildExtension(meta, tree);
        }
        for (let [id, meta] of this.services) {
            if (meta.dismiss)
                continue;
            let service = new tree_1.ModuleTree();
            service.id = id;
            tree.services[id] = service;
            await this.buildService(meta, tree);
        }
        return tree;
    }
    async buildLibrary(meta, tree) {
        if (meta.dismiss)
            return;
        let libraries = tree.libraries;
        libraries[meta.id] = new tree_1.Module(meta.path, 'ESModule');
    }
    async buildExtension(meta, tree) {
        if (meta.dismiss)
            return;
        let extensions = tree.extensions;
        extensions[meta.id] = new tree_1.Module(meta.path, 'ESModule');
    }
    async buildService(meta, tree) {
        if (meta.dismiss)
            return;
        let service = tree.services[meta.id];
        service.config = new tree_1.Module(meta.configFile, 'ESModule');
        service.service = new tree_1.Module(meta.path, 'ESModule');
        let plugins = new tree_1.ModuleTree();
        service.plugins = plugins;
        for (let id of _.keys(meta.plugins)) {
            let pluginMeta = meta.plugins[id];
            if (pluginMeta.dismiss)
                continue;
            let plugin = new tree_1.ModuleTree();
            plugins[id] = plugin;
            await this.buildPlugin(meta, tree, pluginMeta, plugin);
        }
    }
    async buildPlugin(service, tree, pluginMeta, plugin) {
        plugin.id = pluginMeta.id;
        if (!plugin.plugin && pluginMeta.plugin) {
            plugin.plugin = new tree_1.Module(pluginMeta.plugin, 'ESModule');
        }
        if (!plugin.config && pluginMeta.configFile) {
            plugin.config = new tree_1.Module(pluginMeta.configFile, 'ESModule');
        }
    }
    async toModules() {
        await this.load();
        function convent(value) {
            if (value instanceof tree_1.Module) {
                let lib = require(value.path);
                if (value.type !== 'CommonJs' && lib && lib.default) {
                    lib = lib.default;
                }
                return lib;
            }
            else if (value instanceof tree_1.ModulePath) {
                return pathResolve(this.dir, value.path);
            }
            else if (Array.isArray(value)) {
                return value.map(convent);
            }
            else if (value && typeof value === 'object') {
                let result = {};
                for (let key of _.keys(value)) {
                    result[key] = convent(value[key]);
                }
                return result;
            }
            return value;
        }
        let modules = convent(await this.build());
        return modules;
    }
    async toScript() {
        await this.load();
        const requirePath = (path, type) => {
            let str = `require('${this.getRelativePath(path)}')`;
            if (type !== 'CommonJs') {
                str = `importDefault(${str})`;
            }
            return str;
        };
        function convent(value) {
            if (value instanceof tree_1.Module) {
                return requirePath(value.path, value.type);
            }
            else if (value instanceof tree_1.ModulePath) {
                return pathResolve(this.dir, value.path);
            }
            else if (Array.isArray(value)) {
                return `[\n${value.map(convent).join(',\n')}]`;
            }
            else if (value && typeof value === 'object') {
                let result = '{\n';
                for (let key of _.keys(value)) {
                    let k = key;
                    if (/[-\.\/\\]/.test(k)) {
                        k = `'${k}'`;
                    }
                    result += `  ${k}: ${convent(value[key])},\n`;
                }
                return `${result}}`;
            }
            return JSON.stringify(value);
        }
        let script = [
            'Object.defineProperty(exports, "__esModule", { value: true });',
            'function importDefault(lib){return lib && typeof lib==="object" && lib.default!==undefined?lib.default:lib}',
            'module.exports.default = '
        ].join('\n');
        return script + convent(await this.build());
    }
}
